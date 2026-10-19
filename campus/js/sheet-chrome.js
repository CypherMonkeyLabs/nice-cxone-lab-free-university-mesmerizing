(function () {
  var menu = document.getElementById("lab-menu");
  var openBtn = document.getElementById("open-lab-menu");
  var closeBtn = document.getElementById("close-lab-menu");
  function setMenu(open) {
    if (!menu || !openBtn) return;
    menu.hidden = !open;
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    var focusTarget = open ? closeBtn : openBtn;
    if (focusTarget) focusTarget.focus();
  }
  if (openBtn) openBtn.addEventListener("click", function () { setMenu(menu.hidden); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
  if (menu) menu.addEventListener("click", function (event) { if (event.target === menu) setMenu(false); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu && !menu.hidden) setMenu(false);
  });

  var dock = document.getElementById("mascot-dock");
  var speech = document.getElementById("sheet-speech");
  var reading = false;
  var blocks = [];
  var index = 0;
  var idleCopy = "Tap to read this page aloud.";

  function clearMarks() {
    document.querySelectorAll(".read-now").forEach(function (node) { node.classList.remove("read-now"); });
  }
  function pose(name) {
    if (dock) dock.dataset.pose = name;
  }
  function buttons() {
    return document.querySelectorAll("[data-listen]");
  }
  function stop() {
    reading = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    clearMarks();
    pose("still");
    buttons().forEach(function (item) { item.setAttribute("aria-pressed", "false"); });
    if (speech) speech.textContent = idleCopy;
  }
  function speak() {
    if (!reading || index >= blocks.length) {
      stop();
      return;
    }
    var node = blocks[index];
    clearMarks();
    node.classList.add("read-now");
    var text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (speech) speech.textContent = text;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      node.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
    } catch (error) {
      node.scrollIntoView(true);
    }
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance !== "function") return;
    var utter = new SpeechSynthesisUtterance(text);
    try {
      var prefs = JSON.parse(localStorage.getItem("cxone-lab-settings") || "{}");
      if (prefs.rate) utter.rate = Number(prefs.rate) || 1;
      if (prefs.pitch) utter.pitch = Number(prefs.pitch) || 1;
      var voices = window.speechSynthesis.getVoices() || [];
      var voice = null;
      for (var i = 0; i < voices.length; i += 1) {
        if (voices[i].voiceURI === prefs.voice) voice = voices[i];
      }
      if (voice) utter.voice = voice;
    } catch (error) { /* keep the browser voice */ }
    var stepped = false;
    function advance() {
      if (stepped || !reading) return;
      stepped = true;
      index += 1;
      speak();
    }
    utter.onend = advance;
    utter.onerror = function (event) {
      var reason = event && event.error;
      if (reason === "interrupted" || reason === "canceled" || reason === "cancelled") return;
      window.setTimeout(function () { advance(); }, Math.min(4200, Math.max(800, text.length * 42)));
    };
    try {
      window.speechSynthesis.speak(utter);
    } catch (error) {
      window.setTimeout(function () { advance(); }, 800);
    }
    pose("headset");
  }
  function start() {
    var main = document.getElementById("sheet-main");
    if (!main) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    blocks = Array.prototype.filter.call(main.querySelectorAll("h1, h2, p, li, aside"), function (node) {
      return (node.textContent || "").trim().length > 1;
    });
    index = 0;
    reading = true;
    buttons().forEach(function (item) { item.setAttribute("aria-pressed", "true"); });
    speak();
  }
  document.addEventListener("click", function (event) {
    var button = event.target.closest ? event.target.closest("[data-listen]") : null;
    if (!button) return;
    if (button.getAttribute("aria-pressed") === "true") stop();
    else start();
  });

  function band(node, limit) {
    if (!node) return null;
    var rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    var height = Math.min(rect.height, limit);
    return { top: rect.top, right: rect.right, bottom: rect.top + height, left: rect.left, width: rect.width, height: height };
  }
  function leadBands() {
    var main = document.getElementById("sheet-main");
    if (!main) return [];
    var first = main.querySelector(".sheet-body > :first-child");
    return [band(main.querySelector("h1"), 240), band(main.querySelector(".sheet-lead"), 200), band(first, 88)].filter(Boolean);
  }
  function overlaps(a, b) {
    return a.width > 0 && b.width > 0 && a.top < b.bottom - 1 && a.bottom > b.top + 1 && a.left < b.right - 1 && a.right > b.left + 1;
  }
  function parkBot() {
    if (!dock) return;
    var narrow = window.matchMedia("(max-width: 800px)").matches;
    dock.classList.remove("is-inline");
    if (!narrow) return;
    var box = dock.getBoundingClientRect();
    var hit = leadBands().some(function (rect) { return overlaps(box, rect); });
    if (hit) dock.classList.add("is-inline");
  }
  parkBot();
  window.addEventListener("resize", parkBot);
  window.addEventListener("load", parkBot);
})();
