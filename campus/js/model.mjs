/**
 * Classroom models for the NICE CXone Lab.
 * The priority formula matches the static-delivery help page:
 * Overall Priority = (Time * Acceleration) + Initial Priority.
 * Proficiency windows match bullseye help: 1 is best, 20 is worst.
 * This is not the production ACD engine.
 */

export function overallPriority(initial, acceleration, minutes, maximum) {
  const raw = Number(minutes) * Number(acceleration) + Number(initial);
  if (maximum === undefined || maximum === null || maximum === "") return raw;
  return Math.min(Number(maximum), raw);
}

export function proficiencyEligible(proficiency, high, low) {
  const p = Number(proficiency);
  return p >= Number(high) && p <= Number(low);
}

export function validateScript(script) {
  const issues = [];
  const actions = script.actions || [];
  const links = script.links || [];
  const ids = new Set(actions.map((a) => a.id));
  if (!actions.length) {
    issues.push({ level: "error", text: "The canvas is empty. Add a BEGIN action." });
    return issues;
  }
  const begins = actions.filter((a) => a.type === "BEGIN");
  if (begins.length !== 1) {
    issues.push({
      level: "error",
      text: "A phone script in this lab starts with exactly one BEGIN. The inbound tutorial starts the script there.",
    });
  }
  for (const link of links) {
    if (!ids.has(link.from) || !ids.has(link.to)) {
      issues.push({ level: "error", text: "A connector points at an action that is not on the canvas." });
    }
    if (link.from === link.to) {
      issues.push({ level: "warn", text: "An action is connected to itself. Studio branches should move the contact forward." });
    }
  }
  const outgoing = new Set(links.map((l) => l.from));
  for (const action of actions) {
    if (action.type !== "WAIT" && action.type !== "HANGUP_NOTE" && !outgoing.has(action.id) && actions.length > 1) {
      if (action.type !== "WAIT") {
        issues.push({
          level: "warn",
          text: `${action.type} (${action.caption || action.id}) has no outgoing connector.`,
        });
      }
    }
    if (action.type === "REQAGENT" && !String(action.skill || "").trim()) {
      issues.push({
        level: "warn",
        text: "REQAGENT has no skill. Inbound calls use the point of contact skill until this property names a different one.",
      });
    }
    if (action.type === "MENU" && (!action.branches || action.branches < 2)) {
      issues.push({
        level: "warn",
        text: "MENU should offer real choices. The documented sample uses separate branches such as Sales, Support, and Billing.",
      });
    }
    if (action.type === "UPDATECONTACT") {
      const high = Number(action.high);
      const low = Number(action.low);
      if (!(high >= 1 && low <= 20 && high <= low)) {
        issues.push({
          level: "error",
          text: "UPDATECONTACT proficiency must sit inside 1–20, with the high (best) value less than or equal to the low (worst) value.",
        });
      }
    }
    if (action.type === "REQAGENT" && action.high && action.low) {
      const high = Number(action.high);
      const low = Number(action.low);
      if (!(high >= 1 && low <= 20 && high <= low)) {
        issues.push({
          level: "error",
          text: "REQAGENT bullseye window must use proficiency 1 (best) through 20 (worst), high ≤ low.",
        });
      }
    }
  }
  const targets = new Set(links.map((l) => l.to));
  for (const action of actions) {
    if (action.type !== "BEGIN" && !targets.has(action.id)) {
      issues.push({
        level: "warn",
        text: `${action.type} (${action.caption || action.id}) is not reachable from another action.`,
      });
    }
  }
  if (!issues.length) {
    issues.push({ level: "ok", text: "No structural problems found in this learning script." });
  }
  return issues;
}

export const ACTION_CATALOG = [
  {
    type: "BEGIN",
    group: "Flow",
    summary: "Starts the script. The inbound phone tutorial places BEGIN first.",
    cite: "https://help.nicecxone.com/Content/Studio/gettingstarted/developbasicscriptcx.htm",
  },
  {
    type: "MENU",
    group: "IVR",
    summary: "Plays a prompt and stores the contact's choice in a variable.",
    cite: "https://help.nicecxone.com/content/Studio/actions/menu/menu.htm",
  },
  {
    type: "REQAGENT",
    group: "Queue",
    summary: "Requests an agent. Set Skill to leave the point-of-contact default. High/Low proficiency drive bullseye.",
    cite: "https://help.nicecxone.com/content/acd/routing/bullseyerouting.htm",
  },
  {
    type: "MUSIC",
    group: "Queue",
    summary: "Plays hold music. The Classics bullseye example holds Music for 90 seconds before widening proficiency.",
    cite: "https://help.nicecxone.com/content/acd/routing/bullseyerouting.htm",
  },
  {
    type: "WAIT",
    group: "Queue",
    summary: "Waits with the contact while the queue looks for an agent. The basic tutorial pairs it with Music.",
    cite: "https://help.nicecxone.com/Content/Studio/gettingstarted/developbasicscriptcx.htm",
  },
  {
    type: "UPDATECONTACT",
    group: "Queue",
    summary: "Changes priority or the proficiency window so bullseye can widen the agent pool.",
    cite: "https://help.nicecxone.com/content/acd/routing/bullseyerouting.htm",
  },
  {
    type: "COUNTAGENTS",
    group: "Queue",
    summary: "Bullseye can also be configured on COUNTAGENTS.",
    cite: "https://help.nicecxone.com/content/acd/routing/bullseyerouting.htm",
  },
  {
    type: "GETQUEUE",
    group: "Queue",
    summary: "Bullseye can also be configured on GETQUEUE.",
    cite: "https://help.nicecxone.com/content/acd/routing/bullseyerouting.htm",
  },
  {
    type: "TEXTBOT",
    group: "AI",
    summary: "TextBot Exchange sends each digital utterance to a virtual agent, then continues the script.",
    cite: "https://help.nicecxone.com/content/autopilot/autopilot.htm",
  },
  {
    type: "APIACTION",
    group: "API",
    summary: "API actions call CXone REST endpoints. They are not documented as Studio help pages; use the developer portal.",
    cite: "https://help.nicecxone.com/Content/studio/advanced/frameworkactions/apiactions.htm",
  },
];
