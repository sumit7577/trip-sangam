from rest_framework.throttling import AnonRateThrottle


class WebhookRateThrottle(AnonRateThrottle):
    """Rate-limit the (unauthenticated-by-IP) PhonePe webhook. Rate from
    DEFAULT_THROTTLE_RATES['webhook'] — generous so PhonePe retries aren't
    blocked, but caps abuse of the public endpoint."""

    scope = "webhook"
