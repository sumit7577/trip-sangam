"""
Headless preview: when an editor clicks "Preview" in the Wagtail admin we
redirect to the Next.js app with a short-lived signed token. The Next.js
preview route calls back to /api/preview/ with the token; the server validates
it, loads the page's latest draft revision (via modelcluster), and serializes
it through our existing serializers — same JSON shape as the published API.
"""

from __future__ import annotations

from html import escape

from django.conf import settings
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from django.http import HttpResponse

_signer = TimestampSigner(salt="cms.preview")
TOKEN_MAX_AGE = 60 * 60  # 1 hour


def make_preview_token(page_id: int) -> str:
    return _signer.sign(str(page_id))


def verify_preview_token(page_id: int | str, token: str) -> bool:
    try:
        value = _signer.unsign(token, max_age=TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return False
    return value == str(page_id)


class HeadlessPreviewMixin:
    """Mix into Wagtail Page subclasses so Preview shows the Next.js render.

    Returns a same-origin HTML wrapper that embeds the cross-origin Next.js
    preview URL in an iframe. The same-origin response is required for Wagtail's
    in-admin preview pane to detect when loading completes — a plain redirect to
    a cross-origin URL leaves the spinner spinning forever.
    """

    def serve_preview(self, request, mode_name):
        token = make_preview_token(self.pk)
        ct = f"{self._meta.app_label}.{self._meta.model_name}"
        base = getattr(settings, "NEXTJS_PREVIEW_URL", "http://localhost:3000/preview/")
        url = f"{base}?type={ct}&id={self.pk}&token={token}"
        html = (
            "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>"
            "<title>Preview</title>"
            "<style>html,body{margin:0;padding:0;height:100%;background:#f2eee6}"
            "iframe{border:0;width:100%;height:100vh;display:block}</style>"
            "</head><body>"
            f"<iframe src=\"{escape(url, quote=True)}\" allow='fullscreen'></iframe>"
            "</body></html>"
        )
        return HttpResponse(html)
