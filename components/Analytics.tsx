"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsEnabled, track } from "@/lib/analytics";

/**
 * Captures a `$pageview` on first load and on every client-side route change.
 * Manual rather than posthog-js's history patch, which double-fires on App
 * Router navigations. The SDK fills `$current_url` from the location itself.
 */
function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) track("$pageview");
  }, [pathname]);

  return null;
}

/** Renders nothing; the whole tree is skipped without a key. */
export default function Analytics() {
  if (!analyticsEnabled) return null;
  return <PageviewTracker />;
}
