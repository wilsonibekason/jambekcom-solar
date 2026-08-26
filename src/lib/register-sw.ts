/**
 * Single registration point for the generated app-shell service worker.
 * Registration is refused in dev, iframes and Lovable preview hosts, and
 * `?sw=off` acts as a kill switch that unregisters any existing worker.
 */
const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  if (window.self !== window.top) return true;

  const { hostname, search } = window.location;
  if (new URLSearchParams(search).has("sw") && new URLSearchParams(search).get("sw") === "off") {
    return true;
  }
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;
  const blockedSuffixes = [
    "lovableproject.com",
    "lovableproject-dev.com",
    "beta.lovable.dev",
  ];
  return blockedSuffixes.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

async function unregisterAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations
      .filter((registration) => {
        const scriptURL =
          registration.active?.scriptURL ??
          registration.waiting?.scriptURL ??
          registration.installing?.scriptURL ??
          "";
        return scriptURL.endsWith(SW_URL);
      })
      .map((registration) => registration.unregister()),
  );
}

export function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    void unregisterAppWorkers();
    return;
  }
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(SW_URL, { scope: "/" }).catch(() => {
      /* registration failures must never break the app */
    });
  });
}
