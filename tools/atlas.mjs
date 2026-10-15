import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const C = {
  ports: ["Ports and Protocols by Application", "https://help.nicecxone.com/content/platformrequirements/wizard/portsandprotocolsbyapp.htm"],
  portsHub: ["Connectivity Requirements", "https://help.nicecxone.com/Content/platformrequirements/ports.htm"],
  wizard: ["Connectivity Requirements Wizard", "https://help.nicecxone.com/Content/platformrequirements/wizard/discoverconnectivityrequirements.htm"],
  connect: ["Connectivity in NiCE CXone", "https://help.nicecxone.com/Content/globalfeatures/connectivity/connectivityincxone.htm"],
  ip: ["IP Addresses and Blocks", "https://help.nicecxone.com/Content/globalfeatures/connectivity/ipaddresses.htm"],
  e911: ["Set Up Emergency Dialing", "https://help.nicecxone.com/content/acd/channels/voice/setupemergencydialing.htm"],
  e911bu: ["Manage Business Unit", "https://help.nicecxone.com/content/acd/businessunits/managebusinessunit.htm"],
  max911: ["Handle Calls in MAX", "https://help.nicecxone.com/content/agent/max/voice/handlecalls.htm"],
  studio: ["Studio Fundamentals", "https://help.nicecxone.com/content/Studio/fundamentals/fundamentalscx.htm"],
  poc: ["Points of Contact Overview", "https://help.nicecxone.com/content/ACD/channels/additionalchannelfeatures/pointsofcontact/pointsofcontact.htm"],
  inbound: ["Set Up Inbound Voice", "https://help.nicecxone.com/content/ACD/channels/voice/setupibvoice.htm"],
  priority: ["Configure Priority for a Skill for Static Delivery", "https://help.nicecxone.com/content/ACD/routing/staticdelivery/configureskillpriority.htm"],
  bullseye: ["Bullseye Routing", "https://help.nicecxone.com/content/acd/routing/bullseyerouting.htm"],
  pc: ["Customize Proactive Voice Dialing", "https://help.nicecxone.com/Content/acd/channels/personalconnection/proactivevoice/customizeproactivevoicedialing.htm"],
  digital: ["Digital Routing", "https://help.nicecxone.com/content/ACD/digital/digitalrouting.htm"],
  wfm: ["Workforce Management (CXone)", "https://help.nicecxone.com/content/workforcemanagement/welcometoworkforcemanagement.htm"],
  forecast: ["General Forecast", "https://help.nicecxone.com/content/workforcemanagement/generalforecast.htm"],
  recording: ["Recording Management (CXone)", "https://help.nicecxone.com/Content/recording/managerecordings.htm"],
  autopilot: ["NiCE CXone Autopilot (Omilia)", "https://help.nicecxone.com/content/autopilot/autopilot.htm"],
  summary: ["Automated Summary (AutoSummary)", "https://help.nicecxone.com/Content/enlightenautosummary/enlightenautosummary.htm"],
  summarySetup: ["Automated Summary (AutoSummary) Setup", "https://help.nicecxone.com/content/aiassistantsandbots/agentassisthub/autosummary/autosummary.htm"],
  auth: ["Getting Started", "https://developer.niceincontact.com/Documentation/GettingStarted"],
  authz: ["API Authentication and Authorization", "https://developer.niceincontact.com/Documentation/APIAuthenticationAndAuthorization"],
  keys: ["Manage Access Keys", "https://help.nicecxone.com/content/admin/security/manageaccesskeys.htm"],
  sf: ["Integrate Salesforce with Agent Workspace (Agent)", "https://help.nicecxone.com/content/Agent/agentapplicationadministration/cxoneagent/crmintegration/integratesalesforcewithcxa.htm"],
  ticket: ["CRM Ticketing", "https://help.nicecxone.com/content/integratedsolutions/crm%20ticketing/crm%20ticketing.htm"],
  ucce: ["Cisco UCCE Connector", "https://help.nicecxone.com/content/workforcemanagement/ciscoucce.htm"],
  avaya: ["Avaya CMS", "https://help.nicecxone.com/content/workforcemanagement/avayacms.htm"],
  multi: ["Supported Real-Time Third Party Telephony Recording (Multi-ACD)", "https://help.nicecxone.com/Content/cxoneopenthirdparty/configurethirdpartyconnectivity.htm"],
  migrated: ["Migrated Calls", "https://help.nicecxone.com/content/integratedsolutions/migratedinteractions/migratedinteractions.htm"],
  hub: ["Engagement Hub", "https://help.nicecxone.com/content/integratedsolutions/engagementhub.htm"],
  rel: ["26.3 Release Notes", "https://help.nicecxone.com/content/releasenotes/release.htm"],
  rel2: ["26.2 Release Notes", "https://help.nicecxone.com/content/releasenotes/20262release.htm"],
  soon: ["Coming Soon in the 26.4 Release", "https://help.nicecxone.com/content/releasenotes/comingsoon.htm"],
  process: ["NiCE CXone Release Process", "https://help.nicecxone.com/content/releasenotes/releaseprocess.htm"],
  notify: ["Service Notification Timeline", "https://help.nicecxone.com/content/releasenotes/releasenotificationtimeline.htm"],
  ia: ["Data and Reporting", "https://help.nicecxone.com/content/interactionanalyticspro/configurationandadministration/reportinganddata/reportinganddata.htm"],
  iaw: ["Interaction Analytics (CXone) Widget", "https://help.nicecxone.com/content/dashboardwem/iawidgets.htm"],
  dash: ["NiCE CXone Dashboard Permissions", "https://help.nicecxone.com/content/admin/security/permissions/cxonedashboardpermissions.htm"],
  admin: ["Users, Data Access, and Security", "https://help.nicecxone.com/content/admin/welcometoadmin.htm"],
  idp: ["External Identity Provider Authentication", "https://help.nicecxone.com/content/globalfeatures/authenticationandauthorization/setupaaexternalidp.htm"],
  rfc3261: ["RFC 3261", "https://www.rfc-editor.org/rfc/rfc3261"],
  ncie: ["NCIE CXone ACD/IVR", "https://www.credly.com/org/nice-ltd/badge/ncie-nice-certified-implementation-engineer-cxone-m.2"],
  ncieDx: ["NCIE CXone Mpower Digital Experience", "https://www.credly.com/org/nice-ltd/badge/ncie-nice-certified-implementation-engineer-cxone-m.3"],
  ncap: ["NCAP CXone Mpower Workforce Management", "https://www.credly.com/org/nice-ltd/badge/ncap-nice-certified-application-professional-cxone-.3"],
  ncapPc: ["NCAP CXone Mpower Personal Connection", "https://www.credly.com/org/nice-ltd/badge/ncap-nice-certified-application-professional-cxone-.5"],
  sup: ["CXone Supervisor Certification", "https://www.credly.com/org/nice-ltd/badge/cxone-supervisor-certification"],
  club: ["Club One", "https://www.nice.com/clubs/club-one"],
  basic: ["Develop a Basic Script", "https://help.nicecxone.com/Content/Studio/gettingstarted/developbasicscriptcx.htm"],
  menu: ["MENU (Desktop Studio)", "https://help.nicecxone.com/content/Studio/actions/menu/menu.htm"],
};

function cite(key) {
  const pair = C[key];
  return { title: pair[0], url: pair[1] };
}

function row(id, title, caption, labels, key) {
  const nodes = labels.map((label, index) => ({ id: "n" + index, label, x: 0, y: 0 }));
  const edges = nodes.slice(0, -1).map((node, index) => ({ from: node.id, to: "n" + (index + 1), label: "" }));
  return { id, title, caption, layout: "row", nodes, edges, cite: cite(key) };
}

const diagrams = [
  row("inbound", "Inbound entry", "A contact hits one point of contact, one script, and one starting skill.", ["Contact", "POC", "Script", "Skill", "Agent"], "studio"),
  row("words", "Words on the page", "Contact is the person. Interaction is the conversation. Digital is a product family.", ["Contact", "Interaction", "Channel", "Media type"], "digital"),
  row("tenant", "Tenant down to skill", "Admin calls the tenant the billing and global container. Skills are created in a campaign.", ["Tenant", "Campaign", "Skill", "POC"], "admin"),
  { id: "softphones", title: "Two agent-leg options", caption: "Integrated Softphone is the product. WebRTC is the Chrome technology it uses.", layout: "split", left: ["Integrated Softphone", "Nothing to install", "Uses WebRTC", "Allowlist required"], right: ["Installed Softphone", "Separate application", "Not the same name", "Different path"], cite: cite("connect") },
  row("legs", "Two legs", "The carrier hop and the agent hop are not one protocol.", ["Caller", "PSTN or trunk", "CXone", "Agent leg"], "connect"),
  { id: "priority", title: "Overall priority", caption: "Overall priority is (time in minutes × acceleration) + initial priority.", layout: "formula", formula: "(time × acceleration) + initial", example: "initial 4, acceleration 1, 3 minutes → 7", cite: cite("priority") },
  { id: "bullseye", title: "Bullseye window", caption: "Proficiency 1 is best and 20 is worst. REQAGENT opens a window. UpdateContact can widen it.", layout: "rings", rings: ["1 best", "1–5 first", "1–12 later", "20 worst"], cite: cite("bullseye") },
  row("pc", "Personal Connection exception", "Acceleration is forced to 0 so outbound dialing does not age like an inbound queue.", ["Inbound skill", "Acceleration on", "PC skill", "Acceleration 0"], "pc"),
  row("studio", "A Classics-style chain", "BEGIN, a menu, a skill request, music, then a wider window.", ["BEGIN", "MENU", "REQAGENT", "MUSIC", "UpdateContact"], "basic"),
  row("digital", "New inbound digital", "Since Summer 2023, new inbound digital work uses skills and scripts.", ["Chat POC", "Digital skill", "Digital script", "Agent"], "digital"),
  row("wfm", "Forecast before the schedule", "History becomes volume and AHT, then a staffing plan.", ["History", "Forecast", "Target", "Staffing", "Schedule"], "forecast"),
  row("record", "Recording beside QM", "Stereo is the recording default this campus teaches from the recording page. Hold audio is a separate gap.", ["Talk", "Record", "Hold gap", "QM review"], "recording"),
  { id: "hold", title: "What the recorder keeps", caption: "Hold audio, including hold music, is not recorded. A consultation during hold is recorded.", layout: "split", left: ["Talk path", "Recorded", "Consultation on hold", "Recorded"], right: ["Hold music", "Not recorded", "Silence in QA", "Expected gap"], cite: cite("recording") },
  { id: "autopilot", title: "Autopilot voice and text", caption: "Voice setup needs NiCE. Text turns go through Digital Experience and the script.", layout: "split", left: ["Voice", "NiCE setup", "Virtual agent", "One interaction"], right: ["Chat and digital", "Digital Experience", "Virtual Agent Hub", "Script continues"], cite: cite("autopilot") },
  row("summary", "AutoSummary types", "The help page names Structured, Generative, and Hybrid. Email is not supported.", ["Structured", "Generative", "Hybrid", "Not email"], "summary"),
  { id: "grants", title: "Two grants, two jobs", caption: "Back-end integrations on the auth page use the password grant. A person in a browser follows the authorization-code branch.", layout: "split", left: ["Back-end app", "Password grant", "Access key id", "Secret is the password"], right: ["User in a browser", "Authorization code", "scope openid", "Do not copy the password sample"], cite: cite("authz") },
  row("discover", "Find the API host", "tenantId comes from the ID token. The example host is not every tenant.", ["Issuer", "Token", "tenantId", "api_endpoint"], "auth"),
  row("sf", "Salesforce billing gate", "Billing follows how many employees have the Agent Integrations attribute.", ["Employee", "Attribute on", "Agent Workspace", "Billed seat"], "sf"),
  row("e911", "Emergency dialing", "An outbound voice skill, a verified address, and a callback. 933 is the no-charge test named on the page.", ["Outbound skill", "Verified address", "911 or local", "933 test"], "e911"),
  row("voiceports", "IP voice ports the page names", "SIP register to 5060 and 5061. Hardphones also need NTP 123. RTP and SRTP use UDP 1024–65535.", ["SIP 5060", "SIP 5061", "NTP 123", "RTP range"], "ports"),
  row("screenports", "Screen monitoring ports", "UDP 443 or 3478 for WebRTC NAT traversal. Port 31322 is internal to the agent PC.", ["TCP 443", "UDP 3478", "Port 31322", "OS Login skips 31322"], "ports"),
  row("thirdparty", "Named third-party telephony ports", "These bullets name the system. UCCE CTI ports have no default.", ["Avaya AES", "UCCE CTI", "UCCX 12028", "JTAPI 2748"], "ports"),
  row("monitor", "Supervisor WebRTC monitor", "Engagement Hub voice monitoring uses WSS 443 and 10081, then inbound UDP media.", ["Browser", "WSS 10081", "WebRTC SBC", "SRTP in"], "ports"),
  row("release", "A release reaching you", "Coming Soon is 30 days before beta. Your cluster is not beta day.", ["Coming Soon", "Beta", "+ 2 weeks", "Your cluster"], "process"),
  row("clusters", "Three cluster kinds", "Commercial, FedRAMP, and sovereign are defined on the connectivity requirements page.", ["Commercial", "FedRAMP", "Sovereign"], "portsHub"),
  row("certs", "Badges this campus will name", "Credly badge names only. No exam codes or prices are invented.", ["Supervisor", "NCIE ACD", "NCIE Digital", "NCAP WFM"], "ncie"),
  row("moves", "Three different moves", "A WFM connector, Multi-ACD recording, and Migrated Calls are not one cutover.", ["WFM connector", "Multi-ACD", "Migrated Calls", "Not one cookbook"], "ucce"),
  row("tickets", "CRM ticketing pair", "The FAQ names Salesforce and Zendesk. Retention on that page is 90 days.", ["Salesforce", "Zendesk", "Import solved", "90 days"], "ticket"),
  { id: "orbit", title: "Ecosystem orbit", caption: "ACD sits in the middle. Each neighbor is a different product surface.", layout: "orbit", center: "ACD", around: ["Studio", "IVR", "Digital", "WFM", "QM", "Enlighten", "CRM", "APIs"], cite: cite("studio") },
  row("lifecycle", "An integration's life", "Register, pick a grant, discover the tenant, call, and treat the secret as shown once.", ["Register", "Grant", "Discover", "Call", "Rotate"], "keys"),
  row("ivr", "Menu to skill", "MENU stores the choice. The branch requests a more specific skill.", ["Prompt", "MENU", "Variable", "REQAGENT"], "menu"),
  row("analytics", "Analytics leaves the tenant", "Four prebuilt Interaction Analytics reports, widgets, and a JSON export.", ["Prebuilt", "Widgets", "JSON export", "Every 400 or 6 min"], "ia"),
  row("security", "Security gates the pages name", "TLS 1.2, a one-time secret, a role, and an optional external IdP.", ["TLS 1.2", "Access key", "Role", "External IdP"], "connect"),
  row("tfn", "Toll-free and RespOrg", "If CXone is the RespOrg, more toll-free numbers are ordered through CXone.", ["TFN", "RespOrg", "CXone orders", "POC"], "connect"),
  row("hub", "Engagement Hub intake", "Third-party PABX, ACD, CRM, digital, and dialer data can feed Supervisor, Copilot, QM, and WFM.", ["Third party", "Hub", "Supervisor", "QM / WFM"], "hub"),
  row("bcp", "Admin multi-region BCP", "The ports page names HTTPS 443 for the Multi-Region BCP interface, with optional HTTP 80 and FTP 21.", ["Admin BCP", "TCP 443", "Optional 80", "Optional 21"], "ports"),
];

const ports = [
  { use: "Baseline for many selected apps", proto: "HTTPS", port: "443", direction: "Often outbound. Confirm the app you selected.", note: "The page repeats HTTPS 443 across applications. Open only the apps you use. This row is not a claim that every product uses only 443.", cite: "ports" },
  { use: "Optional HTTP", proto: "HTTP", port: "80", direction: "See the app block", note: "Optional, and only if you want HTTP. The page says requests immediately redirect to HTTPS.", cite: "ports" },
  { use: "Optional stored-file access", proto: "FTP", port: "21", direction: "See the app block", note: "Optional, and only if you use FTP to access stored files.", cite: "ports" },
  { use: "Multi-Region BCP in Admin", proto: "HTTPS, optional HTTP, optional FTP", port: "443, 80, 21", direction: "Named on the Admin BCP block", note: "The page says this outright: for the Multi-Region BCP interface in the Admin application.", cite: "ports" },
  { use: "SMTP beside the System Email note", proto: "SMTP", port: "25", direction: "Not stated in the extract", note: "SMTP port 25 is listed next to the System Email explanation. This lab does not assign it to the email ACD channel beyond that placement.", cite: "ports" },
  { use: "IP voice hardphone and softphone registration", proto: "SIP", port: "5060, 5061", direction: "From the customer network to the CXone SBC", note: "The page requires permission to SIP-register to destination ports 5060 and 5061. It does not, in that sentence, say TCP versus UDP.", cite: "ports" },
  { use: "Hardphone clock", proto: "NTP / UDP", port: "123", direction: "Hardphone only", note: "Not listed for the softphone in that bullet.", cite: "ports" },
  { use: "IP voice audio", proto: "RTP, SRTP / UDP", port: "1024–65535", direction: "Dynamically assigned", note: "Audio ports are taken from the entire UDP range.", cite: "ports" },
  { use: "Script calls back to tenant resources", proto: "HTTPS, HTTP, FTP, SFTP", port: "443, 80, 21, 22", direction: "Only if scripts make those requests", note: "Optional for that product. Do not open FTP or SFTP because a script exists.", cite: "ports" },
  { use: "SBC TLS phrase", proto: "TLS", port: "5061", direction: "Inbound and outbound", note: "The page says “Port 5061 for SBC TLS (Inbound and Outbound).” The application heading was not in the text extract, so this row keeps the page’s words and does not invent the product name.", cite: "ports" },
  { use: "Avaya AES TSAPI", proto: "TCP", port: "450, 453, 1050–1081", direction: "Named with the Avaya bullets", note: "450 is fixed. 453 (Avaya 10.2 secured) and 1050–1081 are configurable.", cite: "ports" },
  { use: "Avaya AES DMCC", proto: "TCP", port: "4721–4722", direction: "Named with the Avaya bullets", note: "Configurable.", cite: "ports" },
  { use: "Cisco CG (UCCE)", proto: "TCP", port: "Customer-configured CTI ports", direction: "All CTI servers", note: "No default. Set during installation.", cite: "ports" },
  { use: "Cisco UCCX", proto: "TCP", port: "12028", direction: "Named with the Cisco bullets", note: "Fixed.", cite: "ports" },
  { use: "Cisco JTAPI (CUCM)", proto: "TCP", port: "2748", direction: "Named with the Cisco bullets", note: "Fixed.", cite: "ports" },
  { use: "Genesys T-Lib", proto: "Not limited to one port", port: "All ports allowed", direction: "Named with the Genesys bullet", note: "The page does not publish a single port.", cite: "ports" },
  { use: "Third-party SIP and mTLS", proto: "TCP", port: "5061, mTLS 5065", direction: "Fixed", note: "These are the third-party SIP bullets, separate from the IP-voice 5060/5061 registration sentence.", cite: "ports" },
  { use: "Third-party SRTP", proto: "UDP", port: "6000–65531", direction: "Outbound only, from the customer SBC or Avaya Media Server to the CXone SBC", note: "Fixed. Do not reuse this range as the IP-voice 1024–65535 range.", cite: "ports" },
  { use: "Screen-monitoring NAT traversal", proto: "HTTPS TCP, and UDP", port: "443, and UDP 443 or 3478", direction: "Outbound", note: "Required for WebRTC NAT traversal for screen monitoring, by region.", cite: "ports" },
  { use: "ScreenAgent to Softphone", proto: "Internal", port: "31322", direction: "On the agent computer", note: "Not required when using OS Login.", cite: "ports" },
  { use: "Engagement Hub voice monitoring signal", proto: "TCP / WSS", port: "443 and 10081", direction: "Outbound, supervisor browser to the WebRTC SBC", note: "SIP over WebSocket. Multi-ACD customers, as the heading states.", cite: "ports" },
  { use: "Engagement Hub voice monitoring media", proto: "UDP SRTP/DTLS", port: "Typically 6000–65531", direction: "Inbound, WebRTC SBC to the supervisor browser", note: "The page says “typically.” Treat the edges as the page’s words, not a second fixed range.", cite: "ports" },
  { use: "UDP/TCP 5060 block", proto: "UDP/TCP and UDP", port: "5060, plus UDP 1024–65535", direction: "RTP source range is yours to manage", note: "The page says the RTP stream sources from a wide range and that you manage source ports negotiated in SIP/SDP. The application heading was not in the extract.", cite: "ports" },
];

const pages = [
  {
    id: "deploy",
    title: "Deployment and connectivity",
    lede: "Deployment here means the public connectivity wizard: ports for the apps you use, FQDNs for your cluster, then voice. It is not a professional-services statement of work.",
    blocks: [
      { h: "Three wizard steps", p: ["The wizard tells you to learn ports for the applications you use, then FQDNs and IP addresses for your cluster, then FQDNs and IP addresses for voice.", "The same pages say to monitor the connectivity pages because the lists change. This campus does not freeze an allowlist."], cites: ["wizard", "portsHub"] },
      { h: "Cluster kinds", p: ["The connectivity requirements page defines commercial as the standard environment, FedRAMP as an isolated U.S. federal environment with continuous monitoring and restricted access, and a sovereign cloud as a region that keeps data residency and operations inside a country’s legal boundary.", "If you do not know the cluster, the page says to ask the account representative. Do not guess na1."], cites: ["portsHub", "auth"] },
      { h: "Checklist you can actually run", p: ["Select only the applications in the ports checklist that the tenant uses. Copy that result, not this whole table.", "Allow paired ranges. The IP address page says a missing range is a failover risk.", "Integrated Softphone has its own allowlist, including a separate FedRAMP list, reached through the wizard.", "Require TLS 1.2 and at least one listed cipher in each direction before you call the integration done."], cites: ["ip", "connect"] },
    ],
  },
  {
    id: "cutover",
    title: "Migration checklist, not a fake cutover",
    lede: "The public pages this campus uses describe three different moves. They do not publish one ACD replacement cookbook. The checklist keeps those moves apart.",
    blocks: [
      { h: "Pick the move", p: ["Workforce data from Cisco UCCE or Avaya CMS is a WFM connector. The UCCE connector page and the Multi-ACD version table are different products and name different versions.", "Live third-party phones recorded into CXone are Multi-ACD. Historical files are Migrated Calls and need the Migrated Interactions Upload license.", "Replacing the ACD itself is not a procedure in these pages. Mark that line “ask the account team” instead of inventing weekends and freeze windows."], cites: ["ucce", "multi", "migrated"] },
      { h: "What you can schedule from the cited pages", p: ["Confirm the connector version on the connector’s own page. Do not copy the Multi-ACD table onto WFM.", "For Migrated Calls, export, merge, and import. Every user needs an email. Screen recordings and digital interactions are not supported.", "Vendors named for migrated history include NiCE Engage, CXone, Playback Portal, Uptivity, Verint, Genesys, Calabrio, Witness, Red Box, and Avaya. Anyone else is case by case.", "Engage NMF converts to MP4 on playback. Teams are uploaded, not synchronized."], cites: ["migrated", "avaya"] },
      { h: "Cutover card", p: ["Write the current ACD, the thing that must keep working tomorrow, and which of the three moves you are actually doing.", "Book the change against the release calendar only after you re-read the current cycle page. Targeted dates move, and 26.3 and 26.4 overlap on the pages we read.", "Leave a blank row called “PBX cutover steps.” If a design review fills it with steps that have no URL, delete them."], cites: ["rel", "soon"] },
    ],
  },
  {
    id: "e911",
    title: "E911 and emergency calling",
    lede: "An agent with an outbound voice skill can dial an emergency number. A verified address is what sends that call to the local dispatch center. Unverified addresses go to the national center.",
    blocks: [
      { h: "What you configure", p: ["Set an Emergency Call Notification Email and an Emergency Call Default Callback Phone on the business unit, under Telecom Connectivity.", "If Telephone 1 is filled on the agent profile, that number is the callback instead of the business-unit default.", "Enter the physical address on the user record and save that individual record. The page says a bulk edit is not enough: each address is verified from the individual save. Look for the green Verified for Emergency Call Dispatching mark.", "The agent still needs an outbound phone skill."], cites: ["e911", "e911bu"] },
      { h: "What the agent does in MAX", p: ["US-based agents can type 911. A verified address routes to the local public-safety answering point. Otherwise the call goes to the national emergency center.", "933 tests the configuration. The setup page says that test dial is at no additional cost. Real emergency calls may incur charges, and the feature is not available in every country."], cites: ["max911", "e911"] },
      { h: "What this page will not claim", p: ["This lab does not list country availability, prices, or a SIP header for emergency calls. Those are account-representative and carrier facts.", "Do not treat 933 as a substitute for a real dispatch test plan your own safety team signs."], cites: ["e911"] },
    ],
  },
  {
    id: "reporting",
    title: "Reporting and analytics",
    lede: "Interaction Analytics (CXone) has prebuilt reports, dashboard widgets, and a JSON export. Dashboard permissions are separate from the widget permissions.",
    blocks: [
      { h: "Prebuilt analytics reports", p: ["The data and reporting page names four prebuilt reports: Analytics Metric Statistics, Analytics Category Statistics, Analytics Metric Comparison, and Analytics Metric Trend.", "A short training video is mentioned for the metric and category statistics reports. This campus does not host that video."], cites: ["ia"] },
      { h: "Widgets and the license gate", p: ["The Frustration widget is an Interaction Analytics widget. It needs the Interaction Analytics license plus Analytics > Dashboard Widgets, Dashboard view, and optionally Dashboard edit.", "Organizations with a Performance Management (Native) license can see up to 95 days inside a 25-month lookback. A dashboard-only license is limited to same-day data, on that widget page.", "If the organization is not configured for Dashboard, or the apps do not include ACD or QM, the dashboard permission page says those permissions will not appear."], cites: ["iaw", "dash"] },
      { h: "Export", p: ["Analytics data export writes JSON to a secure external access bucket. Files go out every 400 records or every 6 minutes, whichever comes first.", "The page warns that duplicates can exist and that order is processing order, not contact order. Do not build a deduplicated warehouse assumption on top of silence."], cites: ["ia"] },
    ],
  },
  {
    id: "security",
    title: "Security and what the pages actually require",
    lede: "TLS 1.2, a short cipher list, access keys that inherit an employee, and an external IdP if you configure one. This page does not award the tenant a compliance badge the help page did not name.",
    blocks: [
      { h: "TLS", p: ["Connectivity in NiCE CXone requires at least TLS 1.2.", "Inbound, from CXone to your servers, must support at least one of: TLS_DHE_RSA_WITH_AES_128_GCM_SHA256 (0x009E), TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA (0xC013), TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 (0xC02B), TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 (0xC02C).", "Outbound, from your servers to CXone, must support at least one of: TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (0xC02F) and TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (0xC030). The page recommends both."], cites: ["connect"] },
      { h: "Keys and people", p: ["An access key belongs to an employee and inherits that employee’s permissions. The secret is shown once. Disabling the key kills tokens.", "User-facing apps in this lab follow the authorization-code flow. The authentication pages also show a password grant for back-end integrations, where the username is the access key id.", "External IdP is a documented setup, not the default this page assumes you have."], cites: ["keys", "authz", "idp"] },
      { h: "FedRAMP is an environment, not a slogan", p: ["The connectivity requirements page describes FedRAMP as isolated from commercial operations, with continuous monitoring and restricted access. The API getting-started page names a separate issuer, https://cxone-gov.niceincontact.com.", "This campus does not claim HIPAA, PCI, SOC 2, or a particular encryption-at-rest setting. Those sentences are not in the passages gathered here."], cites: ["portsHub", "auth"] },
    ],
  },
  {
    id: "licensing",
    title: "Licenses the help pages name",
    lede: "A license sentence is a gate. This campus lists gates a cited page states. It does not invent SKUs or prices.",
    blocks: [
      { h: "Named gates", p: ["CRM Ticketing requires a CRM Ticketing license, and the search permission still matters.", "Migrated Calls requires the Migrated Interactions Upload license and the upload permission.", "AutoSummary must be enabled with the account representative. Using it with MAX, rather than an agent application, also needs a Copilot for Agents license.", "Salesforce CRM integration is billed by how many employees have the Agent Integrations attribute enabled. That is not a public price.", "Interaction Analytics widgets require the Interaction Analytics license. Performance Management (Native) changes how much history a widget can show.", "Release notes say some features need a purchased license or a public preview signup. From 26.3, Controlled Release is renamed Public Preview."], cites: ["ticket", "migrated", "summarySetup", "sf", "iaw", "rel"] },
      { h: "Badges, without exam fiction", p: ["Club One offers the CXone Supervisor Certification. Credly also lists NCIE for ACD/IVR, NCIE for Digital Experience, NCAP for Workforce Management, and NCAP for Personal Connection.", "This campus links the badge pages. It does not print exam codes, passing scores, or prices that those pages were not quoted for."], cites: ["club", "sup", "ncie", "ncieDx", "ncap", "ncapPc"] },
    ],
  },
  {
    id: "byoc",
    title: "Carrier, SIP trunk, and PSTN options",
    lede: "“Bring your own carrier” is a campus label for the choices the connectivity page actually describes. It is not a product name copied from a SKU table.",
    blocks: [
      { h: "Three ways the pages talk about voice entry", p: ["PSTN, on the connectivity page, is phone traffic routed by DID or toll-free number.", "A SIP trunk is a virtual connection between a PBX and a carrier, over a phone line, VoIP, or a dedicated path such as MPLS. SIP itself is RFC 3261. This lab does not invent CXone SIP headers.", "The agent leg is separate: Integrated Softphone or the installed Softphone."], cites: ["connect", "rfc3261"] },
      { h: "Toll-free ownership", p: ["If CXone is the RespOrg, you order more toll-free numbers through CXone. The IP address page says you must allow the blocks associated with those numbers and points you at the wizard.", "Voice PoP, in the glossary this campus uses, is the carrier’s physical gateway. The exact PoP for a tenant is a wizard output, not a memorized city."], cites: ["connect", "ip"] },
      { h: "Unverified", p: ["A matrix of BYOC vendors, codec defaults, and OPTIONS timers is not in the cited passages. Leave those cells blank until the current telephony requirements page and the carrier build sheet are open."], cites: ["connect"] },
    ],
  },
  {
    id: "career",
    title: "Study paths",
    lede: "These are campus paths through the tracks. They are not NiCE job postings and they are not hiring promises.",
    blocks: [
      { h: "Administrator", p: ["Start with foundations, platform, ACD setup, and people. Then routing and the deployment atlas. The job inside the lab is: one POC, one skill, one script, and a role that is smaller than yours."], cites: ["admin", "inbound"] },
      { h: "Studio author", p: ["Foundations, Studio, IVR, then the script builder. Validate before you export. The export is a classroom JSON file with notOfficialStudioExport set."], cites: ["basic", "menu"] },
      { h: "WFM analyst", p: ["Forecast volume and AHT, pick a speed-of-answer target, and re-check the plan if bullseye changes who can answer. Keep IEX as a different product."], cites: ["forecast", "wfm"] },
      { h: "Quality supervisor", p: ["Recording, the hold gap, ScreenAgent masks, then the reporting page. Supervisor certification is the Club One badge, not a QM license."], cites: ["recording", "sup"] },
      { h: "Integration engineer", p: ["APIs, the security page, CRM, and the migration checklist. Discover the tenant. Never ship the na1 example as a constant."], cites: ["auth", "keys"] },
    ],
  },
];

const sisters = [
  { name: "CXone WFM", does: "Forecast, schedule, and adherence for CXone. The welcome page states a scale up to 10,000 agents.", cite: "wfm" },
  { name: "IEX WFM", does: "A different workforce product. Its help lives inside the IEX application. Bullseye sends IEX readers to the Distribution Rules Guide.", cite: "bullseye" },
  { name: "Recording and QM", does: "Recording management and quality review. Hold audio is not recorded. Engagement Hub can feed QM.", cite: "recording" },
  { name: "E911", does: "Emergency dialing from an outbound voice skill, with a verified address for local dispatch.", cite: "e911" },
  { name: "Interaction Analytics", does: "Prebuilt reports, dashboard widgets, and a JSON export of transcripts and categories.", cite: "ia" },
  { name: "CRM", does: "Salesforce Agent Workspace and CRM ticketing for Salesforce and Zendesk.", cite: "sf" },
  { name: "Enlighten Autopilot", does: "Virtual agent for voice and digital. Voice needs NiCE. Text needs Digital Experience.", cite: "autopilot" },
  { name: "AutoSummary and Copilot", does: "Summaries after voice or digital messaging. Email is not supported. MAX needs a Copilot for Agents license.", cite: "summary" },
  { name: "Engagement Hub", does: "Brings third-party PABX, ACD, CRM, digital, and dialer data into Supervisor, Copilot, QM, and WFM.", cite: "hub" },
  { name: "APIs", does: "REST, with discovery per tenant and access keys that inherit an employee.", cite: "auth" },
];

const troubles = [
  { symptom: "Spanish agents sit idle while the queue ages", check: "REQAGENT high/low versus the agents’ proficiencies. 1 is best. Look for a missing UpdateContact.", cite: "bullseye" },
  { symptom: "Personal Connection work climbs past inbound", check: "Acceleration on a PC skill should be 0.", cite: "pc" },
  { symptom: "New inbound chat never reaches an agent", check: "You cannot create a new routing queue for that path. Use a digital skill and a digital script.", cite: "digital" },
  { symptom: "QA hears silence where hold music should be", check: "Hold audio is not recorded. Confirm it was hold, not a dropped talk path.", cite: "recording" },
  { symptom: "Integrated Softphone dies after a firewall change", check: "The allowlist, not the carrier, and not the installed Softphone on another floor.", cite: "connect" },
  { symptom: "Second tenant gets a token and then HTML or 401", check: "Hard-coded api-na1. Discover api_endpoint for that tenantId.", cite: "auth" },
  { symptom: "911 reaches the national center", check: "Address saved on the individual user record and showing verified. Outbound skill assigned.", cite: "e911" },
  { symptom: "Screen monitor fails, voice still works", check: "UDP 443 or 3478 outbound, and port 31322 only if OS Login is not in use.", cite: "ports" },
  { symptom: "Supervisor cannot hear a Multi-ACD agent", check: "WSS 443 and 10081 outbound, and the ephemeral UDP range inbound to the browser.", cite: "ports" },
  { symptom: "A feature from Coming Soon is missing on your cluster", check: "Customer clusters start two weeks after beta, a few clusters a week. Some features wait for an update.", cite: "process" },
];

const cycles = [
  { name: "26.2", window: "Begins 29 April 2026. Next cycle was then targeted for 28 July 2026.", note: "Targeted, and the page says features can change.", cite: "rel2" },
  { name: "26.3", window: "Moved to 2 September 2026 through 5 November 2026 after a moratorium. Originally 3 August through 25 October 2026.", note: "Controlled Release is renamed Public Preview in this cycle.", cite: "rel" },
  { name: "26.4 Coming Soon", window: "Begins 26 October 2026. Next release targeted for 4 February 2027.", note: "Overlaps the 26.3 end date published on the other page. Unresolved here.", cite: "soon" },
];

const webrtc = [
  ["AU1", "webrtc-macd-au1.nicecxone.com"],
  ["CA1", "webrtc-macd-ca1.nicecxone.com"],
  ["EU1", "webrtc-macd-eu1.nicecxone.com"],
  ["UK1", "webrtc-macd-uk1.nicecxone.com"],
  ["NA1", "webrtc-macd-na1.nicecxone.com"],
  ["JP1", "webrtc-macd-jp1.nicecxone.com"],
  ["JO1", "webrtc-macd-jo1.nicecxone.com"],
].map(([region, fqdn]) => ({ region, fqdn, cite: "ports", note: "Published on the ports page when this atlas was written. Re-check before you open a firewall. IP addresses on that page are intentionally not copied here." }));

const game = [
  { q: "Where must an IP voice hardphone SIP-register?", choices: ["Destination ports 5060 and 5061 on the CXone SBC", "TCP 2748", "Only UDP 123", "Port 31322"], answer: 0, why: "That sentence is on the ports page.", cite: "ports" },
  { q: "NTP UDP 123 on that same block is for whom?", choices: ["Hardphones only", "Every browser", "ScreenAgent", "The issuer"], answer: 0, why: "The page says hardphone only.", cite: "ports" },
  { q: "Which UDP range does the IP voice block assign to RTP and SRTP?", choices: ["1024–65535", "6000–65531 only", "443 only", "80 and 21"], answer: 0, why: "The third-party SRTP range is a different bullet.", cite: "ports" },
  { q: "Cisco JTAPI for CUCM uses which fixed port?", choices: ["TCP 2748", "TCP 12028", "TCP 450", "UDP 3478"], answer: 0, why: "12028 is UCCX. 450 is Avaya AES TSAPI.", cite: "ports" },
  { q: "Cisco UCCX uses which fixed port?", choices: ["TCP 12028", "TCP 2748", "TCP 5065", "No default, like UCCE CTI"], answer: 0, why: "UCCE CTI ports are customer-configured and have no default.", cite: "ports" },
  { q: "ScreenAgent’s internal port to the Softphone client is?", choices: ["31322, unless you use OS Login", "10081", "25", "5060"], answer: 0, why: "10081 is the supervisor WebRTC signaling port.", cite: "ports" },
  { q: "Engagement Hub supervisor signaling uses?", choices: ["TCP/WSS 443 and 10081, outbound from the browser", "Inbound UDP only", "FTP 21", "SMTP 25"], answer: 0, why: "Media is the inbound UDP leg.", cite: "ports" },
  { q: "Third-party mTLS SIP is on which TCP port?", choices: ["5065", "5060", "450", "3478"], answer: 0, why: "SIP TCP 5061 is the companion fixed port in that bullet.", cite: "ports" },
  { q: "Avaya AES TSAPI port 450 is…", choices: ["Fixed", "Configurable", "UDP only", "Optional HTTP"], answer: 0, why: "453 and 1050–1081 are the configurable ones.", cite: "ports" },
  { q: "HTTP 80 on the general app blocks is…", choices: ["Optional, and redirects to HTTPS", "Required for every agent", "The RTP range", "FedRAMP only"], answer: 0, why: "Do not open it just because it is listed.", cite: "ports" },
  { q: "Personal Connection acceleration should be?", choices: ["0", "1", "Equal to initial priority", "20"], answer: 0, why: "So it does not age like an inbound queue.", cite: "pc" },
  { q: "Overall priority for initial 4, acceleration 1, at 3 minutes?", choices: ["7", "4", "12", "0"], answer: 0, why: "(3 × 1) + 4 = 7.", cite: "priority" },
];

const daily = [
  { q: "How many skills can one point of contact be assigned?", choices: ["One", "Unlimited", "Two", "One per campaign"], answer: 0, why: "One skill and one script. Many POCs may share them.", cite: "poc" },
  { q: "Proficiency 1 means?", choices: ["Best", "Worst", "A channel", "Disabled"], answer: 0, why: "20 is worst.", cite: "bullseye" },
  { q: "New inbound digital routing uses?", choices: ["Digital skills and Studio scripts", "New routing queues", "SMTP 25", "IEX clicks"], answer: 0, why: "Queues remain for outbound digital.", cite: "digital" },
  { q: "AHT on the forecast page is?", choices: ["Average time to complete a transaction, start to finish", "Talk time only, always", "Priority", "Proficiency"], answer: 0, why: "Use the page’s definition.", cite: "forecast" },
  { q: "Hold music in a recording is?", choices: ["Not recorded", "Always recorded in stereo", "Recorded only for 933", "An AutoSummary type"], answer: 0, why: "A consultation during hold is recorded.", cite: "recording" },
  { q: "Integrated Softphone versus WebRTC?", choices: ["The product uses the Chrome technology. They are not synonyms.", "They are the same name", "WebRTC is the installed softphone", "WebRTC is PSTN"], answer: 0, why: "The connectivity page draws that line.", cite: "connect" },
  { q: "The global production issuer on Getting Started is?", choices: ["https://cxone.niceincontact.com", "https://api-na1.niceincontact.com for every tenant", "https://help.nicecxone.com", "SMTP 25"], answer: 0, why: "The FedRAMP issuer is cxone-gov.", cite: "auth" },
  { q: "An unverified E911 address routes where?", choices: ["The national emergency center", "The local PSAP", "A digital skill", "Nowhere"], answer: 0, why: "Verified addresses go to the local PSAP.", cite: "e911" },
  { q: "933 is?", choices: ["The no-charge emergency-configuration test named on the setup page", "A SIP port", "A proficiency", "A cluster"], answer: 0, why: "Real 911 calls may cost extra.", cite: "e911" },
  { q: "Coming Soon notes publish when?", choices: ["30 days before beta clusters", "The morning of your maintenance", "After the last cluster", "Never"], answer: 0, why: "Customer clusters start two weeks after beta.", cite: "process" },
  { q: "Analytics JSON export cadence?", choices: ["Every 400 records or 6 minutes, whichever is first", "Once a night", "Only on demand", "Every SIP OPTIONS"], answer: 0, why: "Duplicates are possible.", cite: "ia" },
  { q: "Access-key secret is shown?", choices: ["Once", "On every login", "In the ID token forever", "In Studio traces"], answer: 0, why: "Disabling the key kills tokens.", cite: "keys" },
  { q: "Minimum TLS on the connectivity page?", choices: ["TLS 1.2", "SSL 3.0", "TLS 1.0", "None, it is optional"], answer: 0, why: "Plus at least one listed cipher each direction.", cite: "connect" },
  { q: "Major releases, per the notification timeline?", choices: ["Four times a year", "Every week", "Once", "Only with a support case"], answer: 0, why: "Deployment dates in notifications are not guaranteed.", cite: "notify" },
];

const labs = [
  { name: "Webex Canon", href: "https://cypherwebex-canon-test.vercel.app", note: "Control Hub, Calling, and both contact-center products." },
  { name: "UC Lab", href: "https://github.com/cipher0x9/uc-lab-free-university-mesmerizing", note: "Offline UC campus. GitHub is the verified public home." },
  { name: "AI Lab", href: "https://github.com/cipher0x9/ai-lab-free-university-mesmerizing", note: "Offline AI campus. GitHub is the verified public home." },
];

const atlas = {
  updated: "2026-10-15",
  honesty: "Facts are paraphrased from the public pages in each cite. Ports and FQDNs change. IP allowlists are not copied. Where a heading was missing from the text extract, the row says so.",
  cites: Object.fromEntries(Object.entries(C).map(([key, pair]) => [key, { title: pair[0], url: pair[1] }])),
  ports,
  webrtc,
  ciphers: {
    minimum: "TLS 1.2",
    inbound: ["0x009E TLS_DHE_RSA_WITH_AES_128_GCM_SHA256", "0xC013 TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA", "0xC02B TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256", "0xC02C TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384"],
    outbound: ["0xC02F TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256", "0xC030 TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"],
    cite: "connect",
  },
  diagrams,
  pages,
  sisters,
  troubles,
  cycles,
  game,
  daily,
  labs,
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "campus", "data");
mkdirSync(root, { recursive: true });
writeFileSync(join(root, "atlas.json"), JSON.stringify(atlas));
console.log("diagrams", diagrams.length, "ports", ports.length, "pages", pages.length, "game", game.length);
