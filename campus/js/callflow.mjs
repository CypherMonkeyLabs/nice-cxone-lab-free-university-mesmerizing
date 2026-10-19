/* Classroom call-flow sandbox. A simulation. It does not place a call. */
import { overallPriority } from "./model.mjs";

const HOPS = [
  { id: "number", label: "Number", detail: "A DID or toll-free number hits one point of contact." },
  { id: "hours", label: "Hours", detail: "Closed hours stop the classroom trace before the script." },
  { id: "script", label: "Script", detail: "The point of contact needs a script or the trace cannot route." },
  { id: "menu", label: "Menu", detail: "A menu stores a digit. This sandbox only shows the chosen digit." },
  { id: "skill", label: "Skill", detail: "Overall priority is (time × acceleration) + initial priority." },
  { id: "agent", label: "Agent", detail: "An agent has to be ready in this simulation. Nothing is dialed." },
];

export function callflowHtml() {
  const hops = HOPS.map((hop) => `
    <button type="button" class="callflow-hop" data-hop="${hop.id}" aria-pressed="true">
      <span class="callflow-hop-label">${hop.label}</span>
      <span class="callflow-hop-state">Open</span>
    </button>`).join("");
  return `<article class="callflow">
    <p class="callflow-banner">Simulation. This does not place a call and it does not contact NiCE. The priority number uses the same classroom formula as the routing simulator.</p>
    <h1>Call-flow sandbox</h1>
    <p>Click a hop to break it. The trace updates in the browser. Voice world: number, hours, script, menu, skill, agent.</p>
    <div class="callflow-stage" data-callflow-stage>${hops}</div>
    <form class="callflow-math" data-callflow-form>
      <label>Initial priority <input name="initial" type="number" min="0" max="1000" value="4"></label>
      <label>Acceleration <input name="accel" type="number" min="0" max="100" value="1" step="1"></label>
      <label>Minutes waiting <input name="minutes" type="number" min="0" max="120" value="3"></label>
      <label>Menu digit <input name="digit" type="text" maxlength="2" value="1"></label>
    </form>
    <p class="callflow-result" data-callflow-result role="status"></p>
    <p class="sources">Classroom formula only. Read the priority lesson before you treat a number as a vendor setting.</p>
  </article>`;
}

export function bindCallflow(root) {
  const stage = root.querySelector("[data-callflow-stage]");
  const form = root.querySelector("[data-callflow-form]");
  const result = root.querySelector("[data-callflow-result]");
  if (!stage || !form || !result) return;
  const broken = new Set();

  function paint() {
    const data = new FormData(form);
    const initial = Number(data.get("initial"));
    const accel = Number(data.get("accel"));
    const minutes = Number(data.get("minutes"));
    const digit = String(data.get("digit") || "").trim() || "1";
    const priority = overallPriority(initial, accel, minutes);
    stage.querySelectorAll("[data-hop]").forEach((button) => {
      const id = button.getAttribute("data-hop");
      const down = broken.has(id);
      button.setAttribute("aria-pressed", down ? "false" : "true");
      button.classList.toggle("is-down", down);
      const state = button.querySelector(".callflow-hop-state");
      if (state) state.textContent = down ? "Broken" : "Open";
    });
    const order = ["number", "hours", "script", "menu", "skill", "agent"];
    const stop = order.find((id) => broken.has(id));
    let sentence;
    if (stop === "number") sentence = "No number is presented. The classroom trace never reaches a point of contact.";
    else if (stop === "hours") sentence = "Hours are closed. The classroom trace stops before the script.";
    else if (stop === "script") sentence = "The point of contact has no script in this simulation, so the skill is not reached.";
    else if (stop === "menu") sentence = "The menu hop is broken. No digit is stored, and the trace does not pick a skill.";
    else if (stop === "skill") sentence = "The skill hop is broken. Priority is not applied because the contact never queues.";
    else if (stop === "agent") sentence = `The contact would queue at priority ${priority} after ${minutes} minutes, but no agent is ready in this simulation.`;
    else sentence = `Menu digit ${digit}. Priority ${priority} after ${minutes} minutes (initial ${initial}, acceleration ${accel}). A ready agent is the last hop. Still a simulation.`;
    result.textContent = sentence;
  }

  stage.addEventListener("click", (event) => {
    const button = event.target.closest("[data-hop]");
    if (!button) return;
    const id = button.getAttribute("data-hop");
    if (broken.has(id)) broken.delete(id);
    else broken.add(id);
    paint();
  });
  form.addEventListener("input", paint);
  paint();
}
