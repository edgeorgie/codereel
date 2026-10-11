// Client-side instrumentation (Next.js `instrumentation-client` convention).
//
// Deliberately tiny: the analytics SDK is only imported (dynamically) when a
// public key is configured, so visitors of a deployment without analytics
// never download it. Starting the import on idle keeps it off the critical
// path; `track()` also loads it on demand, so early events are not lost.
// See lib/analytics.ts.
import { analyticsEnabled, loadAnalytics } from "@/lib/analytics";

if (analyticsEnabled) {
  const start = () => void loadAnalytics();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(start, { timeout: 3000 });
  } else {
    setTimeout(start, 1500);
  }
}
