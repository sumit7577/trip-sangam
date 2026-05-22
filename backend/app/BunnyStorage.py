import requests
from django.conf import settings
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


# @deconstructible lets Django's migration writer serialize a `BunnyStorage()`
# instance — without it, every ImageField/FileField using this storage breaks
# `makemigrations` with "Cannot serialize: <BunnyStorage object>".
#
# Zone name / AccessKey / public host all read off Django settings (which read
# off env). Lets ops flip zones without a code change.
@deconstructible
class BunnyStorage(Storage):
    def __init__(self, directoryName=""):
        self.directoryName = directoryName
        self.session = requests.session()

    # Settings are read lazily (property access) rather than at class-body
    # eval time so test overrides + reload-during-dev work without having
    # to re-import the class. Also keeps `@deconstructible` happy — class
    # attrs that are env-dependent break migration serialization.
    @property
    def _zone_name(self) -> str:
        return getattr(settings, "BUNNY_STORAGE_ZONE_NAME", "") or ""

    @property
    def _access_key(self) -> str:
        return getattr(settings, "BUNNY_STORAGE_ACCESS_KEY", "") or ""

    @property
    def _public_host(self) -> str:
        return getattr(settings, "BUNNY_STORAGE_PUBLIC_HOST", "") or ""

    @property
    def _api_host(self) -> str:
        # Bunny Storage region endpoint. Default zone region (Frankfurt)
        # is `storage.bunnycdn.com`; regional zones use prefixed hosts
        # like `sg.storage.bunnycdn.com`. See settings.BUNNY_STORAGE_API_HOST.
        return getattr(settings, "BUNNY_STORAGE_API_HOST", "storage.bunnycdn.com")

    def create_headers(self):
        return {
            "AccessKey":    self._access_key,
            "Content-Type": "application/octet-stream",
            "accept":       "application/json",
        }

    def create_url(self):
        return f"https://{self._api_host}/{self._zone_name}/"

    def uploadImage(self, fs, filename):
        headers = self.create_headers()
        url = f"{self.create_url()}{self.directoryName}{filename}"
        res = self.session.put(url=url, headers=headers, data=fs)
        if res.status_code == 201:
            return True, f"https://{self._public_host}/{self.directoryName}{filename}"
        else:
            # Bunny error bodies are usually JSON, but a malformed/empty
            # response can come back as plain text — fall back to .text so
            # we don't double-fault inside the error path.
            try:
                return False, res.json()
            except ValueError:
                return False, {"HttpCode": res.status_code, "Message": res.text or ""}

    def _save(self, name, content):
        """Save the given content to Bunny Storage.

        Django's pre_save hook can advance the content position (size check,
        image dimension probe on ImageField, etc.) before Storage._save runs.
        If we hand `requests.put(data=content)` a file-like with the read-
        pointer at EOF, Bunny receives an empty body and rejects it as
        `HTTP 400 — Unable to upload file:`. Seek-to-zero + read the full
        bytes makes the PUT body explicit.
        """
        if hasattr(content, "seek"):
            try:
                content.seek(0)
            except (OSError, ValueError):
                # Some File subclasses don't support seek (e.g. truly
                # streamed uploads). Fall back to handing the file-like
                # straight to requests in that case.
                pass
        if hasattr(content, "read"):
            data = content.read()
        else:
            data = content
        response = self.uploadImage(data, name)
        if response[0]:
            return response[1]
        else:
            raise Exception(response[1])

    def exists(self, name):
        """Skip file existence checks since we don't store files locally."""
        return False

    def url(self, name):
        """Return the URL for the given name (already stored as a string)."""
        return name
