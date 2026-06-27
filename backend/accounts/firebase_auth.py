"""Verify Firebase phone-auth ID tokens server-side.

The frontend runs Firebase phone auth (reCAPTCHA → SMS OTP) and sends us the
resulting ID token. We verify it with the Firebase Admin SDK and trust the
`phone_number` claim. Configure with EITHER:

  FIREBASE_CREDENTIALS_JSON = '<full service-account JSON>'   (preferred for env)
  FIREBASE_CREDENTIALS_FILE = '/path/to/service-account.json'

If neither is set, verification is unavailable and the phone-login endpoint
returns 503 — email login keeps working.
"""
import json
import logging
import os

logger = logging.getLogger(__name__)

_app = None
_init_tried = False


def _get_app():
    """Lazily initialise (and cache) the Firebase Admin app, or None if unconfigured."""
    global _app, _init_tried
    if _app is not None or _init_tried:
        return _app
    _init_tried = True
    try:
        import firebase_admin
        from firebase_admin import credentials
    except Exception:
        logger.warning("firebase-admin not installed; phone login disabled")
        return None

    raw = os.environ.get("FIREBASE_CREDENTIALS_JSON", "").strip()
    path = os.environ.get("FIREBASE_CREDENTIALS_FILE", "").strip()
    try:
        if raw:
            cred = credentials.Certificate(json.loads(raw))
        elif path and os.path.exists(path):
            cred = credentials.Certificate(path)
        else:
            return None
        _app = firebase_admin.initialize_app(cred)
        return _app
    except Exception:
        logger.exception("Failed to initialise Firebase Admin")
        return None


def firebase_configured() -> bool:
    return _get_app() is not None


def verify_phone_token(id_token: str):
    """Return the verified E.164 phone number from a Firebase ID token, or None."""
    app = _get_app()
    if app is None or not id_token:
        return None
    try:
        from firebase_admin import auth as fb_auth

        decoded = fb_auth.verify_id_token(id_token, app=app)
        return decoded.get("phone_number")
    except Exception:
        logger.exception("Firebase ID token verification failed")
        return None
