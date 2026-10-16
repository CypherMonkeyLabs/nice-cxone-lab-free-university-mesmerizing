import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const atlasPath = join(root, "campus", "data", "atlas.json");
const atlas = JSON.parse(readFileSync(atlasPath, "utf8"));

const extraCites = {
  snippet: { title: "SNIPPET (Desktop Studio)", url: "https://help.nicecxone.com/content/Studio/actions/snippet/snippet.htm" },
  amazonQm: { title: "Amazon Connect", url: "https://help.nicecxone.com/content/integratedsolutions/amazonconnect/amazon%20connect.htm" },
  amazonWfm: { title: "Customer Integration Guide - Amazon Connect", url: "https://help.nicecxone.com/content/workforcemanagement/customerintegrationguideamazonconnect.htm" },
  amazonMulti: { title: "Prepare Amazon Connect Environment for Multi-ACD", url: "https://help.nicecxone.com/content/cxoneopenthirdparty/prepareamcenvironmentforcxoneacd.htm" },
  genesysSip: { title: "Prepare Genesys T-Lib with SIPREC", url: "https://help.nicecxone.com/content/cxoneopenthirdparty/genesyssipserverandsiprec.htm" },
  thirdAcd: { title: "Third-Party ACDs", url: "https://help.nicecxone.com/content/workforcemanagement/third-party%20acds.htm" },
  sdk: { title: "Third-Party ACD SDK Developer Guide", url: "https://help.nicecxone.com/content/workforcemanagement/thirdpartysdkdeveloperguide.htm" },
  hub: { title: "Integration Hub", url: "https://help.nicecxone.com/content/integrationhub/integrationhub.htm" },
  cc: { title: "CC BY-NC-SA 4.0", url: "https://creativecommons.org/licenses/by-nc-sa/4.0/" },
  five9: { title: "Five9 bridge", confirm: true },
  webexcc: { title: "Webex Contact Center bridge", confirm: true },
};
Object.assign(atlas.cites, extraCites);

function cite(key) {
  const item = atlas.cites[key];
  return { title: item.title, url: item.url, confirm: item.confirm || false };
}

const more = [
  { id: "snippet-ladder", title: "Snippet versus REST", caption: "The SNIPPET page says custom code is written in Snippet. REST calls from SNIPPET are strongly discouraged. Use the REST API action or Integration Hub.", layout: "ladder", family: "flow", animated: true, flow: "data", lanes: ["Script", "SNIPPET", "REST action", "Integration Hub"], steps: [{ from: 0, to: 1, label: "Custom Snippet code" }, { from: 1, to: 2, label: "Do not put REST here" }, { from: 0, to: 3, label: "Reuse a connection" }], cite: cite("snippet") },
  { id: "snippet-tree", title: "Snippet troubleshooting tree", caption: "If a script author put a REST call inside SNIPPET, the page points at the REST API action or Integration Hub instead.", layout: "tree", family: "flow", animated: true, flow: "troubleshoot", root: "API from a script", branches: [{ label: "Inside SNIPPET", children: ["Discouraged", "Read the SOAP note"] }, { label: "REST action", children: ["Preferred", "Named on the page"] }, { label: "Integration Hub", children: ["Build once", "Reuse"] }], cite: cite("snippet") },
  { id: "amazon-qm-ladder", title: "Amazon Connect recording import", caption: "The Amazon Connect page says voice and screen recordings import into CXone for quality, Interaction Analytics, and reporting. Only new interactions after deployment. Users need an email address.", layout: "ladder", family: "flow", animated: true, flow: "data", lanes: ["Amazon Connect", "S3 archive", "CXone", "QM"], steps: [{ from: 0, to: 1, label: "New calls only" }, { from: 1, to: 2, label: "Email required" }, { from: 2, to: 3, label: "About one hour" }], cite: cite("amazonQm") },
  { id: "amazon-wfm-ladder", title: "Amazon Connect into CXone WFM", caption: "The WFM guide describes an Engagement Hub connector. The connector reads Kinesis and S3. It does not write back into the tenant. One ACD at a time is a separate sentence on the third-party ACD page.", layout: "ladder", family: "flow", animated: true, flow: "migration", lanes: ["Amazon Connect", "Connector", "ACD Hub", "CXone WFM"], steps: [{ from: 0, to: 1, label: "Kinesis and S3" }, { from: 1, to: 2, label: "Read only" }, { from: 2, to: 3, label: "Forecast and adherence" }], cite: cite("amazonWfm") },
  { id: "amazon-multi-ladder", title: "Amazon Connect Multi-ACD prepare", caption: "The prepare page says you configure AWS, then a NiCE account representative finishes the CXone side. Call audio is read from Kinesis Video Streams. This ladder is not a copy of the AWS steps.", layout: "ladder", family: "flow", animated: true, flow: "signal", lanes: ["Amazon Connect", "Kinesis Video", "Your AWS", "CXone"], steps: [{ from: 0, to: 1, label: "Live media streaming" }, { from: 1, to: 2, label: "You configure" }, { from: 2, to: 3, label: "Account rep finishes" }], cite: cite("amazonMulti") },
  { id: "genesys-ladder", title: "Genesys T-Lib with SIPREC", caption: "The Genesys page is Multi-ACD recording, not the WFM connector list. It says you configure Genesys T-Lib before Multi-ACD, and that Genesys licenses cover device and agent seat access.", layout: "ladder", family: "flow", animated: true, flow: "signal", lanes: ["Genesys", "T-Lib", "SIPREC", "CXone Multi-ACD"], steps: [{ from: 0, to: 1, label: "Configure T-Lib first" }, { from: 1, to: 2, label: "Recording metadata" }, { from: 2, to: 3, label: "Not a WFM cutover" }], cite: cite("genesysSip") },
  { id: "third-acd-tree", title: "Which WFM bridge is named", caption: "The third-party ACD page names Engagement Hub for Avaya CMS and Amazon Connect, an SDK path that names Smart Reach, and point-to-point for Cisco UCCE, Cisco UCCX, and Avaya CMS_Legacy. Five9 and Webex Contact Center are not in that list.", layout: "tree", family: "flow", animated: true, flow: "migration", root: "CXone WFM and another ACD", branches: [{ label: "Engagement Hub", children: ["Avaya CMS", "Amazon Connect"] }, { label: "SDK", children: ["Smart Reach", "Java toolkit"] }, { label: "Point to point", children: ["UCCE", "UCCX"] }], cite: cite("thirdAcd") },
  { id: "one-acd", title: "One ACD at a time", caption: "The same page says CXone WFM supports integration with only one ACD at a time. A third-party ACD and the CXone ACD are not integrated together.", layout: "row", family: "flow", animated: true, flow: "architecture", nodes: [{ id: "n0", label: "One ACD" }, { id: "n1", label: "Not both" }, { id: "n2", label: "15-minute history" }, { id: "n3", label: "WCE, not TTI" }], edges: [{ from: "n0", to: "n1" }, { from: "n1", to: "n2" }, { from: "n2", to: "n3" }], cite: cite("thirdAcd") },
  { id: "sdk-ladder", title: "Third-party ACD SDK", caption: "The SDK guide describes a Java toolkit that posts agent states, queue reports, and agent activity into CXone WFM. It is the path when a named connector does not exist. It does not name Five9 or Webex Contact Center.", layout: "ladder", family: "flow", animated: true, flow: "data", lanes: ["Your connector", "SDK", "Token", "CXone WFM"], steps: [{ from: 0, to: 1, label: "Java jar" }, { from: 1, to: 2, label: "Bearer token" }, { from: 2, to: 3, label: "States and reports" }], cite: cite("sdk") },
  { id: "hub-ladder", title: "Integration Hub templates", caption: "Integration Hub names system templates for the CXone developer portal, Microsoft Dynamics 365, Salesforce, ServiceNow, and Zendesk. Other REST calls are custom. This is not a Five9 or Webex Contact Center connector.", layout: "ladder", family: "flow", animated: true, flow: "architecture", lanes: ["Studio", "Integration Hub", "Template", "External API"], steps: [{ from: 0, to: 1, label: "Build once" }, { from: 1, to: 2, label: "OAuth template" }, { from: 2, to: 3, label: "Reuse" }], cite: cite("hub") },
  { id: "five9-confirm", title: "Five9 bridge", caption: "No NiCE help page that this lab opened names a Five9 connector. The third-party ACD list does not include Five9. Confirm before relying. There is no URL.", layout: "row", family: "map", animated: false, nodes: [{ id: "n0", label: "Five9" }, { id: "n1", label: "confirm" }, { id: "n2", label: "No URL" }], edges: [{ from: "n0", to: "n1" }, { from: "n1", to: "n2" }], cite: cite("five9") },
  { id: "webexcc-confirm", title: "Webex Contact Center bridge", caption: "No NiCE help page that this lab opened names a Webex Contact Center connector. Confirm before relying. There is no URL. This is separate from the Webex study lab.", layout: "row", family: "map", animated: false, nodes: [{ id: "n0", label: "Webex CC" }, { id: "n1", label: "confirm" }, { id: "n2", label: "No URL" }], edges: [{ from: "n0", to: "n1" }, { from: "n1", to: "n2" }], cite: cite("webexcc") },
  { id: "ucce-named", title: "Cisco UCCE on the WFM list", caption: "Point-to-point integrations on the third-party ACD page name Cisco UCCE and Cisco UCCX, and they say those integrations require Advanced Services. That is not the Multi-ACD recording table.", layout: "ladder", family: "flow", animated: true, flow: "migration", lanes: ["UCCE", "Point to point", "Advanced Services", "CXone WFM"], steps: [{ from: 0, to: 1, label: "Named on the page" }, { from: 1, to: 2, label: "Not a self-serve cookbook" }, { from: 2, to: 3, label: "One ACD" }], cite: cite("thirdAcd") },
  { id: "cert-mpower", title: "CXone Mpower on the badge", caption: "The Credly page that opened for NCIE ACD/IVR uses the words CXone Mpower in the earning criteria. This lab does not add exam codes or prices.", layout: "row", family: "map", animated: true, nodes: [{ id: "n0", label: "NCIE" }, { id: "n1", label: "ACD/IVR" }, { id: "n2", label: "CXone Mpower" }, { id: "n3", label: "No exam code" }], edges: [{ from: "n0", to: "n1" }, { from: "n1", to: "n2" }, { from: "n2", to: "n3" }], cite: cite("ncie") },
  { id: "ports-genesys", title: "Genesys T-Lib on the ports page", caption: "The ports page says Genesys T-Lib is not limited to one port. That bullet is not the SIPREC procedure.", layout: "row", family: "flow", animated: true, flow: "signal", nodes: [{ id: "n0", label: "Genesys T-Lib" }, { id: "n1", label: "All ports allowed" }, { id: "n2", label: "Ports page" }], edges: [{ from: "n0", to: "n1" }, { from: "n1", to: "n2" }], cite: cite("ports") },
  { id: "release-confirm", title: "26.2 page did not open", caption: "A direct open of the stored 26.2 release-notes URL returned 404 on 2026-10-16. The dates already written in Contact Path stay marked confirm. No URL is shown for that page.", layout: "row", family: "map", animated: false, nodes: [{ id: "n0", label: "26.2 URL" }, { id: "n1", label: "404" }, { id: "n2", label: "confirm" }], edges: [{ from: "n0", to: "n1" }, { from: "n1", to: "n2" }], cite: { title: "26.2 Release Notes", confirm: true } },
];

const have = new Set(atlas.diagrams.map((item) => item.id));
for (const diagram of more) {
  if (!have.has(diagram.id)) atlas.diagrams.push(diagram);
}

const bridges = {
  id: "bridges",
  title: "Bridges from other contact centers",
  lede: "These are the moves a public NiCE page actually names. Five9 and Webex Contact Center are confirm, with no URL.",
  blocks: [
    { h: "Cisco UCCE and UCCX", p: ["The third-party ACD page lists Cisco UCCE and Cisco UCCX as point-to-point WFM integrations and says those require Advanced Services.", "The UCCE WFM connector page and the Multi-ACD recording table are different products. Do not copy a version from one onto the other."], cites: ["thirdAcd", "ucce", "multi"] },
    { h: "Genesys", p: ["Genesys is not in the WFM third-party ACD list this lab opened.", "The ports page says Genesys T-Lib is not limited to one port.", "A separate page prepares Genesys T-Lib with SIPREC for Multi-ACD recording. That is recording, not a WFM cutover."], cites: ["ports", "genesysSip"] },
    { h: "Amazon Connect", p: ["One page imports new voice and screen recordings into CXone for quality, analytics, and reporting. Users need an email address. Historical calls from before deployment are not the import the page describes.", "A WFM guide describes an Engagement Hub connector that reads Kinesis and S3 and does not write back into the tenant.", "A Multi-ACD page says you prepare AWS and a NiCE account representative finishes the CXone side."], cites: ["amazonQm", "amazonWfm", "amazonMulti"] },
    { h: "Five9 and Webex Contact Center", p: ["No page this lab opened names a Five9 connector or a Webex Contact Center connector. Both are confirm. No URL is attached.", "The SDK guide is a general Java toolkit for an ACD that does not already have a named connector. It does not say that toolkit is a Five9 or Webex Contact Center product."], cites: ["five9", "webexcc", "sdk"] },
    { h: "Worked example", p: ["If the question is workforce data from UCCE, stay on the WFM connector page. If the question is live third-party audio, stay on Multi-ACD. If the question is Five9, stop and mark confirm."], cites: ["thirdAcd"] },
    { h: "Quiz", p: ["CXone WFM integrates with one ACD at a time, on the third-party ACD page. A third-party ACD and the CXone ACD are not both connected."], cites: ["thirdAcd"] },
  ],
};
if (!atlas.pages.some((page) => page.id === "bridges")) atlas.pages.push(bridges);
atlas.updated = "2026-10-16";
writeFileSync(atlasPath, JSON.stringify(atlas));
console.log("diagrams", atlas.diagrams.length, "flows", atlas.diagrams.filter((item) => item.family === "flow" && item.animated && item.flow).length);

const confirm = new Set([
  "https://help.nicecxone.com/content/releasenotes/20262release.htm",
  "https://www.credly.com/org/nice-ltd/badge/ncap-nice-certified-application-professional-cxone-.3",
  "https://www.credly.com/org/nice-ltd/badge/ncap-nice-certified-application-professional-cxone-.5",
]);
const dir = join(root, "campus", "data", "sources");
mkdirSync(dir, { recursive: true });
function pack(id, cites) {
  const sources = cites.map((item) => {
    if (!item || item.confirm || confirm.has(item.url) || !item.url) {
      return { title: item?.title || "Source", status: "confirm", note: "Direct open failed or no page was found. No URL." };
    }
    return { title: item.title, url: item.url, status: "opened", checked: "2026-10" };
  });
  writeFileSync(join(dir, `${id}.json`), JSON.stringify({ room: id, checked: "2026-10", sources }, null, 2));
}
const seen = new Map();
for (const [key, item] of Object.entries(atlas.cites)) {
  if (!seen.has(item.url || key)) seen.set(item.url || key, item);
}
pack("atlas", [...seen.values()]);
for (const page of atlas.pages) {
  const cites = [];
  for (const block of page.blocks || []) {
    for (const key of block.cites || []) cites.push(atlas.cites[key] || { title: key, confirm: true });
  }
  pack(page.id, cites);
}
const { readdirSync } = await import("node:fs");
const tracks = join(root, "campus", "data", "tracks");
for (const file of readdirSync(tracks)) {
  const track = JSON.parse(readFileSync(join(tracks, file), "utf8"));
  const cites = [];
  for (const lesson of track.lessons) {
    for (const section of lesson.sections || []) cites.push(...(section.cites || []));
    for (const extra of lesson.also || []) cites.push(extra);
  }
  pack(track.id, cites);
}
console.log("sources", readdirSync(dir).length);
