/**
 * Thin analytics facade (PostHog), the same shape as the owner's other apps.
 *
 * - No key: `track()` returns early and posthog-js is never downloaded, so a
 *   deployment without `NEXT_PUBLIC_POSTHOG_KEY` makes no analytics request.
 * - With a key: the SDK is imported dynamically after hydration, off the
 *   critical path; events queued before it loads are flushed.
 * - Cookieless: no cookies, no storage, no consent banner. PostHog derives a
 *   daily anonymous id server-side; `identify()` is never called.
 * - Transport goes through this origin (`/ingest`, see next.config.ts) on a
 *   Node host. The static export has no proxy, so the Pages deploy sets
 *   `NEXT_PUBLIC_POSTHOG_HOST` and its CSP allows that host.
 * - Every event carries `app` and `surface` so one PostHog project can hold
 *   every app. User content never leaves the browser: no code, titles,
 *   prompts or links are sent, only buckets, counts, booleans and enums.
 *
 * See docs/adr/0003-cookieless-product-analytics.md.
 */
import type { PostHog } from "posthog-js";
import { compositionDuration } from "./scene.ts";
import type { AspectPreset, Composition } from "./scene.ts";

type Props = Record<string, string | number | boolean | null | undefined>;

const ANALYTICS_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const analyticsEnabled = Boolean(ANALYTICS_KEY);
/** The `app` super property; the same PostHog project holds every app. */
export const APP = "codereel";

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
const queue: { event: string; props?: Props }[] = [];

export function loadAnalytics(): Promise<PostHog | null> {
  // Tests the inlined env value itself, not `analyticsEnabled`: the bundler can
  // only prune the import() below, and so drop the SDK chunk, when the guard is
  // a literal it can evaluate (next.config.ts makes an unset key a build-time "").
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || typeof window === "undefined") return Promise.resolve(null);
  if (client) return Promise.resolve(client);
  if (loading) return loading;
  loading = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(ANALYTICS_KEY as string, {
        // Same-origin path proxied by next.config.ts rewrites, unless the deploy (GitHub Pages) points at PostHog directly.
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
        ui_host: "https://us.posthog.com",
        defaults: "2026-08-30",
        cookieless_mode: "always",
        person_profiles: "never",
        autocapture: false,
        capture_pageview: false, // sent manually with the app property (see components/Analytics.tsx)
        disable_session_recording: true,
        respect_dnt: true,
      });
      posthog.register({ app: APP, surface: "web" });
      client = posthog;
      for (const q of queue.splice(0)) posthog.capture(q.event, q.props);
      return posthog;
    })
    .catch(() => null);
  return loading;
}

/** Fire-and-forget event. Safe to call anywhere, in any environment. */
export function track(event: string, props?: Props): void {
  if (!analyticsEnabled) return;
  if (client) {
    client.capture(event, props);
    return;
  }
  queue.push({ event, props });
  void loadAnalytics();
}

export type DurationBucket = "<5s" | "5-30s" | "30-120s" | "120s+";

/** Coarse length of a video, shared across the owner's apps, so no exact duration can fingerprint a visitor. */
export function durationBucket(seconds: number): DurationBucket {
  if (seconds < 5) return "<5s";
  if (seconds < 30) return "5-30s";
  if (seconds < 120) return "30-120s";
  return "120s+";
}

export interface ExportProperties {
  aspect: string;
  duration_bucket: DurationBucket;
  fps: number;
}

/** The whole payload of `video_exported`: the shape of the video, never its code or title. */
export function exportProperties(comp: Composition, preset: AspectPreset): ExportProperties {
  return { aspect: preset.label, duration_bucket: durationBucket(compositionDuration(comp)), fps: comp.fps };
}
