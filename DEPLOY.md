# Sangam Travels — Deploy Runbook

Deploy via Docker on the same VM that runs allcoaching. Uses the existing
`sumit_proxy` nginx-proxy + acme-companion network → automatic SSL per
subdomain.

**Two subdomains:**

| Subdomain | Container | Serves |
|---|---|---|
| `sangamtravels.com` (or whatever you pick) | `sangam-frontend` | Next.js public site |
| `cms.sangamtravels.com` | `sangam-backend` | Wagtail admin + API |

Both subdomains need their A records pointed at the VM's external IP before
you start (acme-companion needs to reach them on :80 to issue certs).

---

## 1. SSH into the VM

```bash
gcloud compute ssh YOUR_VM_NAME --zone=YOUR_ZONE
```

---

## 2. Confirm prerequisites

The VM should already have these from the allcoaching deploy. Confirm:

```bash
docker --version
docker compose version
docker network ls | grep sumit_proxy
```

If `sumit_proxy` is missing (fresh VM), create the proxy stack — see allcoaching
docs for the canonical nginx-proxy + acme-companion setup. **Stop here if it
isn't running**; the rest assumes it is.

---

## 3. Clone the repo

```bash
sudo mkdir -p /srv && sudo chown $USER:$USER /srv
cd /srv
git clone YOUR_REPO_URL sangam-travel
cd sangam-travel
```

If the repo is private, use a deploy key or `gh auth login` first.

---

## 4. Create the production `.env` (in repo root)

```bash
cat > .env <<'EOF'
# ── Domains ────────────────────────────────────────────────────────────────
SITE_DOMAIN=sangamtravels.com
CMS_DOMAIN=cms.sangamtravels.com
LETSENCRYPT_EMAIL=you@example.com

# ── Django ─────────────────────────────────────────────────────────────────
DJANGO_SECRET_KEY=REPLACE_ME

# ── Bunny CDN (leave blank to use local volume) ────────────────────────────
BUNNY_STORAGE_ZONE_NAME=
BUNNY_STORAGE_ACCESS_KEY=
BUNNY_STORAGE_PUBLIC_HOST=
BUNNY_STORAGE_API_HOST=storage.bunnycdn.com
BUNNY_STORAGE_DIRECTORY=sangam/
EOF
```

Then generate a real Django secret and replace `REPLACE_ME` in place:

```bash
SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(60))")
sed -i "s|REPLACE_ME|$SECRET|" .env
```

Edit `.env` to set your real `SITE_DOMAIN`, `CMS_DOMAIN`, `LETSENCRYPT_EMAIL`, and
Bunny credentials.

---

## 5. Build images and start

```bash
docker compose -f sangam-stack.yaml build
docker compose -f sangam-stack.yaml up -d
```

First boot does three things automatically (via the backend entrypoint):

- Runs Django migrations
- Runs `collectstatic --noinput`
- Seeds initial content (one-time, guarded by `/app/data/.seeded` marker)

Watch logs for ~30 seconds until both containers are healthy:

```bash
docker compose -f sangam-stack.yaml logs -f --tail=100
```

Wait for: `Booting worker with pid` (backend) and `▲ Next.js … Ready` (frontend).

---

## 6. Create the Wagtail superuser

```bash
docker compose -f sangam-stack.yaml exec sangam-backend python manage.py createsuperuser
```

---

## 7. Verify

```bash
# DNS resolves to VM
dig +short $(grep SITE_DOMAIN .env | cut -d= -f2)
dig +short $(grep CMS_DOMAIN .env | cut -d= -f2)

# Both subdomains return 200 (give acme-companion ~60s on first launch to
# issue the certs, retry the curl until 200 + valid cert)
curl -fsS -o /dev/null -w "site: %{http_code}\n" https://$(grep SITE_DOMAIN .env | cut -d= -f2)/
curl -fsS -o /dev/null -w "cms : %{http_code}\n" https://$(grep CMS_DOMAIN .env | cut -d= -f2)/admin/
curl -fsS -o /dev/null -w "api : %{http_code}\n" https://$(grep CMS_DOMAIN .env | cut -d= -f2)/api/packages/
```

Then open:

- `https://sangamtravels.com` — public site
- `https://cms.sangamtravels.com/admin/` — Wagtail admin (log in with the
  superuser you just created)

---

## Updating after code changes

```bash
cd /srv/sangam-travel
git pull
docker compose -f sangam-stack.yaml build
docker compose -f sangam-stack.yaml up -d
```

The entrypoint runs migrations + collectstatic on every boot. Seeding is
skipped on subsequent boots (marker file in the data volume).

## Re-seeding from scratch (destructive)

```bash
docker compose -f sangam-stack.yaml exec sangam-backend python manage.py seed_data --wipe
```

## Logs

```bash
docker compose -f sangam-stack.yaml logs -f sangam-backend
docker compose -f sangam-stack.yaml logs -f sangam-frontend
```

## One-off Django commands

```bash
docker compose -f sangam-stack.yaml exec sangam-backend python manage.py shell
docker compose -f sangam-stack.yaml exec sangam-backend python manage.py migrate
```

## Stopping / removing

```bash
docker compose -f sangam-stack.yaml down              # stop containers, keep volumes (DB safe)
docker compose -f sangam-stack.yaml down -v           # also delete DB volume — DESTRUCTIVE
```

## Troubleshooting

**Cert not issued / browser warns about HTTPS** → acme-companion needs DNS to
already resolve to the VM AND port 80 reachable. Check `docker logs
nginx-proxy-acme` (or whatever your acme container is named).

**`403 CSRF verification failed` on Wagtail admin login** → make sure
`CSRF_TRUSTED_ORIGINS` in the backend container env includes
`https://cms.your-domain` exactly (the compose file already wires this from
`CMS_DOMAIN`).

**Bunny upload fails** → confirm all four Bunny env vars are set in `.env`,
then `docker compose -f sangam-stack.yaml restart sangam-backend`. Test with a
quick image upload via Wagtail admin → Images → Add an image.

**Need to migrate to Postgres later** → swap `DATABASES` in `sangam/settings.py`
and add a postgres service to the compose file. SQLite data on the `sangam-db`
volume can be exported with `dumpdata` before the switch.
