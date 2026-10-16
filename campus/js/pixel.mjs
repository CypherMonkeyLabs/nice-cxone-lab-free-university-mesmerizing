const MOBILE_QUERY = "(max-width: 720px)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

export function cappedPixelRatio() {
  const dpr = window.devicePixelRatio || 1;
  const mobile = typeof matchMedia === "function" && matchMedia(MOBILE_QUERY).matches;
  return Math.min(dpr, mobile ? 1.5 : 2);
}

export function motionReduced() {
  const root = document.documentElement;
  if (root.dataset.motion === "reduce") return true;
  if (root.dataset.motion === "full" && root.dataset.motionLock === "1") return false;
  return typeof matchMedia === "function" && matchMedia(REDUCE_QUERY).matches;
}
