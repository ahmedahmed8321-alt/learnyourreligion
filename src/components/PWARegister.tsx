"use client";

import { useEffect } from "react";

/** Registers the minimal (no-cache) service worker so the site is installable
 *  as a PWA on Android — a prerequisite for the share-target feature. */
export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore registration errors — the site works fine without it */
      });
    }
  }, []);
  return null;
}
