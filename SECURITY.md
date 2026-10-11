# Security

## Reporting

Use GitHub's private vulnerability reporting on this repository (Security tab, Report a vulnerability). Do not open a public issue for a vulnerability.

## Scope and assumptions

- API keys are entered by the user and stored in the browser. They are sent only to the provider the user selects. Any script injection on the origin could read them, so do not paste keys into untrusted deployments.
- User content (notes, screenshots, prompts) is processed in the browser. The README lists what is sent to a model provider.
- Model output is validated and rendered as text, never as HTML.
- Analytics is optional and cookieless. A deployment without `NEXT_PUBLIC_POSTHOG_KEY` makes no analytics request and does not register the `/ingest` proxy route, so it relays nothing to PostHog on anyone's behalf; with it, `/ingest/*` forwards to PostHog's ingestion hosts only and events carry only formats, buckets and counts, never code, titles, prompts or keys (ADR 0003).
