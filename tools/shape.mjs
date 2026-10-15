import { cite } from "./cites.mjs";

export function row(caption, nodes, edges) {
  return { kind: "row", caption, nodes, edges };
}

export function rings(caption, ringList, agents) {
  return { kind: "rings", caption, rings: ringList, agents };
}

export function flow(title, lanes, steps) {
  return { title, lanes, steps };
}

export function step(from, to, label, detail, inspect) {
  return { from, to, label, detail, inspect: inspect || {} };
}

export function sec(h, paragraphs, keys) {
  return { h, p: paragraphs, cites: keys.map(cite) };
}

export function q(question, choices, answer, why, key) {
  if (!Array.isArray(choices) || choices.length < 3) throw new Error("choices " + question);
  if (answer < 0 || answer >= choices.length) throw new Error("answer " + question);
  return { q: question, choices, answer, why, cite: cite(key) };
}

export function card(front, back) {
  return { front, back };
}

export function lab(title, goal, steps, done) {
  return { title, goal, steps, done };
}

export function fault(title, symptom, log, cause, fix, key) {
  return { title, symptom, log, cause, fix, cite: cite(key) };
}

export function quick(o) {
  const sections = o.sections.map((entry) => sec(entry[0], entry[1], entry[2]));
  const quiz = o.quiz.map((entry) => q(entry[0], entry[1], entry[2], entry[3], entry[4]));
  const cards = o.cards.map((entry) => card(entry[0], entry[1]));
  return lesson({
    id: o.id,
    title: o.title,
    level: o.level,
    minutes: o.minutes,
    summary: o.summary,
    objectives: o.objectives,
    figure: o.figure,
    sections,
    flow: o.flow,
    quiz,
    cards,
    lab: lab(o.lab[0], o.lab[1], o.lab[2], o.lab[3]),
    faults: o.faults.map((entry) => fault(entry[0], entry[1], entry[2], entry[3], entry[4], entry[5])),
    uncertain: o.uncertain || [],
  });
}

export function lesson(spec) {
  const required = ["id", "title", "level", "minutes", "summary", "objectives", "figure", "sections", "flow", "quiz", "cards", "lab", "faults"];
  for (const key of required) {
    if (spec[key] == null) throw new Error(`${spec.id || spec.title}: missing ${key}`);
  }
  if (spec.quiz.length < 6) throw new Error(spec.id + " quiz");
  if (spec.cards.length < 4) throw new Error(spec.id + " cards");
  if (spec.lab.steps.length < 3) throw new Error(spec.id + " lab");
  if (spec.faults.length < 1) throw new Error(spec.id + " fault");
  if (spec.flow.steps.length < 4) throw new Error(spec.id + " flow");
  spec.uncertain = spec.uncertain || [];
  return spec;
}
