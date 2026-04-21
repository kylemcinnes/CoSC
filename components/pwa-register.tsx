"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js (public/sw.js) after load.
 * Next.js does not register a service worker automatically — this keeps the stack dependency-free.
 */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* non-fatal: localhost http sometimes blocks SW */
    });
  }, []);
  return null;
}
