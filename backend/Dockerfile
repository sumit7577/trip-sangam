# Sangam Travels — Django + Wagtail backend.
# Mirrors the allcoachingAdmin Dockerfile pattern (Python slim + gunicorn).
FROM python:3.13.5-slim

WORKDIR /app

# build-essential for any C-extension wheels; rm apt cache to keep image small.
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir gunicorn

COPY . /app/

# Volume mount point for SQLite + staticfiles (see compose file).
RUN mkdir -p /app/data /app/staticfiles /app/media

EXPOSE 8000

# entrypoint runs migrations + collectstatic on every boot, then exec gunicorn.
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["gunicorn", "--workers", "3", "--timeout", "120", "--worker-class", "gthread", "--threads", "3", "--bind", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-", "sangam.wsgi:application"]
