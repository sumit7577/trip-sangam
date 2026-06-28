"""Thin Razorpay client for Standard Checkout (Orders + signature verify),
via the REST API.

Flow: backend creates an **Order** → frontend opens Razorpay Checkout (checkout.js)
with the order id → on success the frontend posts back
``razorpay_order_id/payment_id/signature`` which we verify
(HMAC-SHA256(order_id|payment_id, key_secret)); a signed webhook
(``payment.captured``) is the backup source of truth.

Test vs live is decided by the key (``rzp_test_*`` vs ``rzp_live_*``) on the same
api.razorpay.com host. When keys are absent, ``is_configured()`` is False and
callers return 503 instead of hitting the network. (Auth: HTTP Basic.)
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


def create_order(amount_paise, receipt, notes=None):
    """Create a Razorpay Order. Returns {id, amount, currency, raw}."""
    _require_configured()
    if int(amount_paise) < 100:
        raise GatewayError("Amount must be at least 100 paise.")
    payload = {"amount": int(amount_paise), "currency": "INR", "receipt": str(receipt)[:40]}
    if notes:
        payload["notes"] = {k: str(v) for k, v in notes.items()}
    try:
        resp = requests.post(f"{settings.RAZORPAY_BASE}/orders", json=payload, auth=_auth(), timeout=_TIMEOUT)
        resp.raise_for_status()
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise GatewayError(f"create_order failed: {exc}") from exc
    return {"id": body.get("id", ""), "amount": body.get("amount"), "currency": body.get("currency", "INR"), "raw": body}


def fetch_order(order_id):
    """Fetch an order's status. Returns {status, raw}. (created/attempted/paid)"""
    _require_configured()
    try:
        resp = requests.get(f"{settings.RAZORPAY_BASE}/orders/{order_id}", auth=_auth(), timeout=_TIMEOUT)
        resp.raise_for_status()
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise GatewayError(f"fetch_order failed: {exc}") from exc
    return {"status": body.get("status", ""), "raw": body}


def captured_payment_id(order_id):
    """Find a captured payment id for an order (used for refunds when not stored)."""
    _require_configured()
    try:
        resp = requests.get(f"{settings.RAZORPAY_BASE}/orders/{order_id}/payments", auth=_auth(), timeout=_TIMEOUT)
        resp.raise_for_status()
        items = resp.json().get("items", [])
    except (requests.RequestException, ValueError) as exc:
        raise GatewayError(f"order payments fetch failed: {exc}") from exc
    for p in items:
        if p.get("status") == "captured":
            return p.get("id")
    return None


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


def verify_payment_signature(order_id, payment_id, signature) -> bool:
    """Verify the checkout success signature: HMAC-SHA256(order_id|payment_id)."""
    secret = settings.RAZORPAY_KEY_SECRET
    if not (secret and order_id and payment_id and signature):
        return False
    expected = hmac.new(secret.encode(), f"{order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature.strip())


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    """Verify the X-Razorpay-Signature header (HMAC-SHA256 of the raw body)."""
    secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not secret or not signature:
        return False
    expected = hmac.new(secret.encode(), raw_body or b"", hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature.strip())
