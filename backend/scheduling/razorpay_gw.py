"""Thin Razorpay client (Payment Links + refunds), via the REST API.

We use Razorpay **Payment Links** so the existing redirect flow is preserved:
create a link → redirect the traveller to ``short_url`` → Razorpay hosts the
checkout (UPI/cards/netbanking/wallets) → redirects back to the booking page,
and a signed webhook (``payment_link.paid``) is the source of truth.

Test vs live mode is decided by the key (``rzp_test_*`` vs ``rzp_live_*``) on the
same api.razorpay.com host — no separate base URL. When keys are absent,
``is_configured()`` is False and callers return 503 instead of hitting the network.

Docs: razorpay.com/docs/payments/payment-links (Auth: HTTP Basic key_id:key_secret).
"""
import hashlib
import hmac
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

_TIMEOUT = 12  # seconds


class GatewayError(Exception):
    """Any failure talking to Razorpay."""


def is_configured():
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def _require_configured():
    if not is_configured():
        raise GatewayError("Razorpay credentials are not configured.")


def _auth():
    return (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)


def create_payment_link(reference_id, amount_paise, callback_url, customer=None, description="", notes=None):
    """Create a Razorpay Payment Link. Returns {id, short_url, status, raw}."""
    _require_configured()
    payload = {
        "amount": int(amount_paise),
        "currency": "INR",
        "reference_id": reference_id,
        "description": (description or "Trip Sangam booking")[:255],
        "callback_url": callback_url,
        "callback_method": "get",
        "reminder_enable": False,
        "notify": {"sms": False, "email": False},
    }
    cust = {k: v for k, v in (customer or {}).items() if v}
    if cust:
        payload["customer"] = cust
    if notes:
        payload["notes"] = {k: str(v) for k, v in notes.items()}
    try:
        resp = requests.post(
            f"{settings.RAZORPAY_BASE}/payment_links",
            json=payload, auth=_auth(), timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise GatewayError(f"create_payment_link failed: {exc}") from exc
    return {
        "id": body.get("id", ""),
        "short_url": body.get("short_url", ""),
        "status": body.get("status", ""),
        "raw": body,
    }


def fetch_payment_link(plink_id):
    """Fetch a payment link's status. Returns {status, raw}."""
    _require_configured()
    try:
        resp = requests.get(
            f"{settings.RAZORPAY_BASE}/payment_links/{plink_id}",
            auth=_auth(), timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise GatewayError(f"fetch_payment_link failed: {exc}") from exc
    return {"status": body.get("status", ""), "raw": body}


def refund(payment_id, amount_paise):
    """Refund a captured payment. Returns {id, status, raw}."""
    _require_configured()
    try:
        resp = requests.post(
            f"{settings.RAZORPAY_BASE}/payments/{payment_id}/refund",
            json={"amount": int(amount_paise)}, auth=_auth(), timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise GatewayError(f"refund failed: {exc}") from exc
    return {"id": body.get("id", ""), "status": body.get("status", ""), "raw": body}


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    """Validate the X-Razorpay-Signature header (HMAC-SHA256 of the raw body)."""
    secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not secret or not signature:
        return False
    expected = hmac.new(secret.encode(), raw_body or b"", hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature.strip())
