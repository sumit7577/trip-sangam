"""Thin PhonePe Standard Checkout v2 client.

Endpoints/headers per developer.phonepe.com (see docs/slot-booking-design.md §7):
  * Auth (OAuth):  POST {AUTH_URL}              form: client_id/secret/version, grant_type=client_credentials
  * Create order:  POST {PG_BASE}/checkout/v2/pay                Authorization: O-Bearer <token>
  * Order status:  GET  {PG_BASE}/checkout/v2/order/{moid}/status
  * Refund:        POST {PG_BASE}/payments/v2/refund
  * Webhook auth:  Authorization == sha256("<user>:<pass>")

All network calls are isolated here so the rest of the app (and tests) can mock
this module. When credentials are absent, ``is_configured()`` is False and the
callers return 503 rather than hitting the network.
"""
import hashlib
import logging
import time

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

_TIMEOUT = 10  # seconds
# Simple in-process token cache: {"token": str, "expires_at": epoch_seconds}.
_token_cache = {"token": "", "expires_at": 0}


class PhonePeError(Exception):
    """Any failure talking to PhonePe."""


def is_configured():
    return bool(settings.PHONEPE_CLIENT_ID and settings.PHONEPE_CLIENT_SECRET)


def _require_configured():
    if not is_configured():
        raise PhonePeError("PhonePe credentials are not configured.")


def get_access_token(force=False):
    """Return a valid O-Bearer access token, refreshing if near expiry."""
    _require_configured()
    now = time.time()
    if not force and _token_cache["token"] and _token_cache["expires_at"] - 60 > now:
        return _token_cache["token"]

    try:
        resp = requests.post(
            settings.PHONEPE_AUTH_URL,
            data={
                "client_id": settings.PHONEPE_CLIENT_ID,
                "client_secret": settings.PHONEPE_CLIENT_SECRET,
                "client_version": settings.PHONEPE_CLIENT_VERSION,
                "grant_type": "client_credentials",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise PhonePeError(f"Auth request failed: {exc}") from exc

    token = body.get("access_token")
    if not token:
        raise PhonePeError(f"Auth response missing access_token: {body}")
    _token_cache["token"] = token
    # expires_at is epoch seconds; fall back to a short TTL if absent.
    _token_cache["expires_at"] = int(body.get("expires_at") or (now + 600))
    return token


def _auth_headers():
    return {
        "Content-Type": "application/json",
        "Authorization": f"O-Bearer {get_access_token()}",
    }


def create_order(merchant_order_id, amount_paise, redirect_url, meta=None):
    """Create a checkout order. Returns {orderId, redirectUrl, state, raw}."""
    _require_configured()
    payload = {
        "merchantOrderId": merchant_order_id,
        "amount": int(amount_paise),
        "paymentFlow": {
            "type": "PG_CHECKOUT",
            "merchantUrls": {"redirectUrl": redirect_url},
        },
    }
    if meta:
        payload["metaInfo"] = meta
    try:
        resp = requests.post(
            f"{settings.PHONEPE_PG_BASE}/checkout/v2/pay",
            json=payload,
            headers=_auth_headers(),
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise PhonePeError(f"create_order failed: {exc}") from exc
    return {
        "orderId": body.get("orderId", ""),
        "redirectUrl": body.get("redirectUrl", ""),
        "state": body.get("state", ""),
        "raw": body,
    }


def order_status(merchant_order_id):
    """Fetch authoritative order status. Returns {state, amount, raw}."""
    _require_configured()
    try:
        resp = requests.get(
            f"{settings.PHONEPE_PG_BASE}/checkout/v2/order/{merchant_order_id}/status",
            headers=_auth_headers(),
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise PhonePeError(f"order_status failed: {exc}") from exc
    return {"state": body.get("state", ""), "amount": body.get("amount"), "raw": body}


def refund(merchant_refund_id, original_merchant_order_id, amount_paise):
    """Initiate a refund. Returns {refundId, state, raw}."""
    _require_configured()
    try:
        resp = requests.post(
            f"{settings.PHONEPE_PG_BASE}/payments/v2/refund",
            json={
                "merchantRefundId": merchant_refund_id,
                "originalMerchantOrderId": original_merchant_order_id,
                "amount": int(amount_paise),
            },
            headers=_auth_headers(),
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise PhonePeError(f"refund failed: {exc}") from exc
    return {"refundId": body.get("refundId", ""), "state": body.get("state", ""), "raw": body}


def verify_webhook_auth(authorization_header):
    """Validate the `Authorization: sha256(user:pass)` header PhonePe sends."""
    user = settings.PHONEPE_WEBHOOK_USERNAME
    pwd = settings.PHONEPE_WEBHOOK_PASSWORD
    if not (user and pwd) or not authorization_header:
        return False
    expected = hashlib.sha256(f"{user}:{pwd}".encode()).hexdigest()
    received = authorization_header.strip()
    # PhonePe may or may not prefix the scheme; compare the hex part only.
    if " " in received:
        received = received.split(" ", 1)[1].strip()
    return received.lower() == expected.lower()
