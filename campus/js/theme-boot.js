try {
  var saved = JSON.parse(localStorage.getItem("cxone-lab-settings") || "{}");
  var root = document.documentElement;
  if (saved.theme) root.dataset.theme = saved.theme;
  if (saved.font) root.dataset.font = saved.font;
  if (saved.ink) root.dataset.ink = saved.ink;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (saved.motionLock && (saved.motion === "reduce" || saved.motion === "full")) {
    root.dataset.motion = saved.motion;
    root.dataset.motionLock = "1";
  } else {
    root.dataset.motion = reduce ? "reduce" : "full";
  }
} catch (error) {}
