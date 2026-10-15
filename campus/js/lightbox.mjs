let step = 0;
let playing = true;

function ensure() {
  return document.getElementById("diagram-light");
}

export function bindLightbox(root) {
  const scope = root || document;
  if (scope.dataset.light === "1") return;
  scope.dataset.light = "1";
  scope.addEventListener("click", (event) => {
    const button = event.target.closest("[data-enlarge]");
    const card = event.target.closest(".diagram-card");
    if (!button && !(card && event.target.closest("svg"))) return;
    const host = button ? button.closest(".diagram-card") : card;
    if (!host) return;
    open(host);
  });
  const dialog = ensure();
  if (!dialog || dialog.dataset.bound === "1") return;
  dialog.dataset.bound = "1";
  dialog.querySelector("#light-close").addEventListener("click", () => dialog.close());
  dialog.querySelector("#light-play").addEventListener("click", () => {
    const svg = dialog.querySelector("svg");
    playing = !playing;
    if (svg && svg.pauseAnimations) {
      if (playing) svg.unpauseAnimations();
      else svg.pauseAnimations();
    }
    dialog.querySelector("#light-play").textContent = playing ? "Pause" : "Play";
  });
  dialog.querySelector("#light-step").addEventListener("click", () => {
    const wires = dialog.querySelectorAll(".wire");
    if (!wires.length) return;
    step = (step + 1) % wires.length;
    wires.forEach((wire, index) => wire.classList.toggle("hot", index === step));
  });
}

function open(card) {
  const dialog = ensure();
  if (!dialog) return;
  const svg = card.querySelector("svg");
  const caption = card.querySelector("figcaption");
  const sources = card.querySelector(".sources");
  step = 0;
  playing = true;
  dialog.querySelector("#light-play").textContent = "Pause";
  dialog.querySelector("#light-body").innerHTML = svg ? svg.outerHTML : "";
  dialog.querySelector("#light-why").textContent = caption ? caption.textContent : "";
  dialog.querySelector("#light-sources").innerHTML = sources ? sources.innerHTML : "";
  const wires = dialog.querySelectorAll(".wire");
  if (wires[0]) wires[0].classList.add("hot");
  if (!dialog.open) dialog.showModal();
}
