# ADR 0003: Cookieless product analytics, off without a key

Status: accepted

## Context

The owner's portfolio links to codereel and wants one answer across all of its apps: which get used, and how. For codereel that is opens, exports and the formats people pick. This repository's rule is that keys and user content stay in the browser, visitors must not need a cookie banner, and anyone who deploys a fork must not report to the owner's analytics by accident.

## Decision

posthog-js, imported dynamically only when `NEXT_PUBLIC_POSTHOG_KEY` is set at build time. Cookieless (`cookieless_mode: "always"`, `person_profiles: "never"`, `identify()` never called), autocapture and session replay off, `respect_dnt` on. Events are an explicit allowlist, `$pageview`, `editor_opened` and `video_exported`, whose properties are enums, buckets and numbers; every event carries `app: "codereel"` and `surface: "web"` so one PostHog project holds every app. On a Node host events go through a same-origin `/ingest` proxy (rewrites in `next.config.ts`). The static export cannot proxy, so the Pages build reaches PostHog directly only when `NEXT_PUBLIC_POSTHOG_HOST` is set, and its CSP allows that host only then.

## Consequences

- Without the key the facade returns early: no SDK download, no request, no console output. Nothing changes for the existing deployments until the variable is set.
- No cookies and no storage, so no consent banner. The cost is no cross-day identity, which this product does not need.
- Code, titles, prompts, provider keys and import links are never sent, so the promise that user data stays in the browser still holds; the README's data flow table says so.
- Blockers that filter by domain do not drop the proxied traffic; those that block `/ingest` paths may, which is acceptable.
- Two PostHog project settings must match the client: cookieless mode enabled (otherwise cookieless events are ignored) and "Discard client IP data". The client-side `ip` option is deprecated and has no effect in posthog-js 1.438.7, so it is not set; the project setting is what keeps IP addresses out.
- `next.config.ts` pins `NEXT_PUBLIC_POSTHOG_KEY` to a build-time `""` when unset. Turbopack otherwise leaves an unset public variable as a runtime lookup and still emits the posthog-js chunk (about 315 KB) even though it can never load. With the pin, a build without a key contains no PostHog code at all, which is what makes "no key, no SDK" checkable with `grep -rli posthog .next/static`.
- A new event or property is a change to FR-11 first, reviewed for content leakage.
