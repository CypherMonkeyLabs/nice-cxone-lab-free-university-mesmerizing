import { lesson, row, rings, flow, step, sec, q, card, lab, fault } from "./shape.mjs";

const phone = ["Caller", "POC", "Studio", "ACD", "Agent"];

export const part1 = [
  {
    id: "foundations",
    title: "Foundations and prerequisites",
    blurb: "Contacts, points of contact, skills, scripts, and the network facts you need before you touch Admin.",
    accent: 1,
    lessons: [
      lesson({
        id: "what-routes",
        title: "What the platform actually routes",
        level: "foundation",
        minutes: 12,
        summary: "An inbound contact enters through a point of contact. That point of contact names one ACD skill and one Studio script, and the script may choose a more specific skill.",
        objectives: ["Name POC, skill, and script", "Separate channel from media type", "See where an IVR changes the skill"],
        figure: row("Entry path from Studio Fundamentals", [
          { id: "c", label: "Contact", sub: "caller or chatter", tone: 2 },
          { id: "p", label: "POC", sub: "one skill", tone: 1 },
          { id: "s", label: "Script", sub: "one flow", tone: 3 },
          { id: "k", label: "Skill", sub: "agents", tone: 4 },
        ], [
          { from: "c", to: "p", label: "enters" },
          { from: "p", to: "s", label: "assigned" },
          { from: "s", to: "k", label: "may retarget" },
        ]),
        sections: [
          sec("Four words", [
            "Studio Fundamentals uses four words for the rest of this floor. An ACD skill automates delivery to an agent who is likely to help, using criteria such as department, specialty, language, or location. A channel is the medium a contact uses. A media type is the kind of channel a script is built for, such as phone, chat, or email. A point of contact is the entry, such as a phone number or an email address.",
            "Each point of contact is assigned one ACD skill and one Studio script. Several points of contact may share a skill or a script. The script begins with the point of contact's default skill and can select a more specific skill, for example after a menu.",
          ], ["studioFund"]),
          sec("Why the default skill is not the whole story", [
            "The help page's phone example is the familiar menu: sales, support, or billing. Those spoken choices correspond to ACD skills. If you leave the script without a decision, every contact stays on the single skill that was assigned to the point of contact.",
            "That is the whole inbound contract. Memorize it before you memorize button paths in Admin. The later ACD track walks the clicks. This lesson is the shape those clicks have to produce.",
          ], ["studioFund", "poc"]),
        ],
        flow: flow("A contact takes the default skill, then a menu retargets it", phone, [
          step("Caller", "POC", "Dial the TFN", "The number is a point of contact only after it exists in the tenant.", { DNIS: "configured by Professional Services" }),
          step("POC", "Studio", "Hand off the script", "The POC carries exactly one script.", { script: "MainInbound" }),
          step("Studio", "ACD", "Start on the default skill", "The script begins with the skill assigned on the POC.", { skill: "Main_IB" }),
          step("Studio", "ACD", "Menu chooses Sales", "A branch requests a more specific skill.", { choice: "1", skill: "Sales_IB" }),
          step("ACD", "Agent", "Deliver", "An agent assigned to Sales_IB can receive the contact.", { delivery: "skill match" }),
        ]),
        quiz: [
          q("How many skills can one point of contact be assigned?", ["One", "As many as the campaign has", "Two, one inbound and one outbound", "Unlimited"], 0, "Points of Contact Overview says only one skill and one script can be assigned to each POC. Multiple POCs can share a skill.", "poc"),
          q("What does a Studio script start from?", ["The POC's default ACD skill", "A random available agent", "The tenant's first campaign", "The agent's team"], 0, "Studio Fundamentals says the script starts with the default ACD skill assigned from the POC.", "studioFund"),
          q("Which pair names a media type versus a channel, as the fundamentals page uses the words?", ["Media type is what the script is built for, such as phone or chat. Channel is the medium.", "They are synonyms and the help uses them interchangeably with no distinction.", "Media type is the carrier. Channel is the skill.", "Channel is always digital and media type is always voice."], 0, "The fundamentals page defines both. A script is created for a specific media type.", "studioFund"),
          q("A menu that offers sales, support, and billing is choosing among what?", ["ACD skills", "Business units", "Login authenticators", "Access keys"], 0, "The fundamentals example maps those menu options to ACD skills.", "studioFund"),
          q("Can three toll-free numbers share one script?", ["Yes. Multiple POCs can be assigned to the same script.", "No. A script can be attached to only one phone number.", "Only if they are in different tenants.", "Only for digital channels."], 0, "The POC overview says multiple POCs can be assigned to the same skill or script.", "poc"),
          q("If the script never changes the skill, who is eligible?", ["Agents on the single skill assigned to the POC", "Every agent in the business unit", "Only agents with proficiency 1", "Only supervisors"], 0, "Without a more specific choice, the contact stays with the POC skill.", "studioFund"),
        ],
        cards: [
          card("Point of contact", "The entry a contact uses, such as a phone number or email address. One skill and one script."),
          card("ACD skill", "The object that automates delivery to agents based on skills, abilities, and knowledge."),
          card("Media type", "The kind of channel a script is created for: phone, chat, email, and so on."),
          card("Default skill", "The skill on the POC. The script starts there and may replace it."),
        ],
        lab: lab("Trace three numbers on paper", "Show that several entries can share a script while each entry still has one skill.", [
          "Write three toll-free numbers down the left of a page.",
          "Draw one Studio script box and connect all three numbers to it.",
          "Give each number its own skill name, then rewrite one number so its script branches to a second skill after a menu press.",
          "Mark the object that is still exactly one-per-entry: the POC's assigned skill and the POC's assigned script.",
        ], "You can point at which object changed inside the script and which object did not."),
        faults: [
          fault("Two skills on one number", "Administrators argue about which skill 'the 800 number' uses, and reports disagree.", "POC 8005550142 skill=Sales_IB script=Main\nPOC 8005550142 skill=Support_IB script=Main  << rejected", "Someone tried to hang two skills on one point of contact. The overview allows many POCs on one skill, not many skills on one POC.", "Create a second point of contact, or let the script's Reqagent actions choose the second skill after the menu.", "poc"),
        ],
      }),
      lesson({
        id: "contact-words",
        title: "Contact, interaction, and channel",
        level: "foundation",
        minutes: 10,
        summary: "Help pages use contact for the person and interaction for the full conversation on a channel. Digital is a specific family of channels, not a synonym for every non-voice contact.",
        objectives: ["Use contact and interaction the way the help does", "Keep digital skills separate from legacy ACD skills", "Notice when a page says voice and digital together"],
        figure: row("Words the help pages actually use", [
          { id: "p", label: "Contact", sub: "the person", tone: 2 },
          { id: "i", label: "Interaction", sub: "the conversation", tone: 1 },
          { id: "d", label: "Digital", sub: "DX family", tone: 3 },
          { id: "v", label: "Voice", sub: "phone media", tone: 4 },
        ], [
          { from: "p", to: "i", label: "has" },
          { from: "i", to: "v", label: "or" },
          { from: "i", to: "d", label: "or" },
        ]),
        sections: [
          sec("The glossary inside the help", [
            "On the digital routing page, a contact is the person interacting with an agent, IVR, or bot. An interaction, on the Autopilot page, is the full conversation through a channel: a voice call, email, chat, or social conversation.",
            "Digital, on those same pages, means any channel, contact, or skill associated with Digital Experience. It is not a casual word for 'not a phone call.' Legacy ACD channels such as phone, email, and chat have their own script types. Digital channels share one digital script type.",
          ], ["digitalRouting", "autopilot", "digitalChannels"]),
          sec("Why the distinction shows up in routing", [
            "Before the Summer 2023 release, digital contacts were primarily routed with Digital Experience routing queues. New inbound digital routing is configured with digital skills and Studio scripts. Routing queues remain for outbound digital interactions.",
            "If you import a voice habit ('make a queue') into digital inbound work, you are building the pattern the help page tells you to stop creating.",
          ], ["digitalRouting", "digitalSkills"]),
        ],
        flow: flow("A digital contact is not given a new routing queue", ["Contact", "Channel", "Digital skill", "Script", "Agent"], [
          step("Contact", "Channel", "Opens chat", "The channel is a digital point of contact.", { channel: "chat" }),
          step("Channel", "Digital skill", "Default skill", "The POC starts on a digital ACD skill.", { type: "Digital" }),
          step("Script", "Digital skill", "May retarget", "The digital script can request a different digital skill.", { method: "preferred" }),
          step("Digital skill", "Agent", "Deliver", "The agent needs the digital skill and the Digital Engagement attribute.", { attribute: "Digital Engagement" }),
        ]),
        quiz: [
          q("On the digital routing page, who is the contact?", ["The person interacting with an agent, IVR, or bot", "The agent's employee profile", "The point of contact phone number", "The Studio action"], 0, "That is the help page's own definition.", "digitalRouting"),
          q("What should new inbound digital routing use?", ["Digital skills and Studio scripts", "New routing queues", "A phone script with a digital media type", "Personal Connection pacing"], 0, "Manage Digital Skills says skills plus custom digital scripts are the preferred method, and you cannot create new routing queues.", "digitalSkills"),
          q("What still uses routing queues?", ["Outbound digital interactions", "Every inbound phone call", "Access key generation", "WFM forecasts"], 0, "Digital Routing says the system still uses routing queues to route outbound interactions.", "digitalRouting"),
          q("Which script type covers digital channels?", ["One digital script type for all digital channels", "A separate script type for each social network", "The phone script type", "No script; only workflow automation"], 0, "Digital Channels says the digital script type is for all digital channels. Other script types are for legacy ACD channels.", "digitalChannels"),
          q("When did routing queues stop being the primary inbound digital method?", ["Prior to the Summer 2023 release they were primary; new inbound configuration uses skills and scripts", "They were removed in the 26.3 release only", "They were never used", "They remain the only supported inbound method"], 0, "Digital Routing states the Summer 2023 change directly.", "digitalRouting"),
          q("Is 'digital' on these pages a synonym for SMS only?", ["No. It is the Digital Experience family of channels, contacts, and skills.", "Yes. Digital means SMS and nothing else.", "Yes. Digital means email only.", "It means the public switched telephone network."], 0, "The inline definition says any channel, contact, or skill associated with Digital Experience.", "digitalChannels"),
        ],
        cards: [
          card("Contact", "The person talking to an agent, IVR, or bot."),
          card("Interaction", "The full conversation on a channel."),
          card("Digital skill", "An ACD skill whose media type is Digital."),
          card("Routing queue", "The older digital inbound object. Do not create new ones. Still used for outbound digital."),
        ],
        lab: lab("Sort eight sticky notes", "Separate legacy ACD words from Digital Experience words.", [
          "Write these eight labels: phone skill, digital skill, routing queue, digital script, phone script, outbound digital reply, inbound chat, IVR menu.",
          "Put inbound chat, digital skill, and digital script in one column.",
          "Put the routing queue note on outbound digital only, and write 'do not create for new inbound' on it.",
          "Leave the IVR menu in the voice column.",
        ], "A teammate can see which objects the Summer 2023 change retired for new inbound work."),
        faults: [
          fault("New routing queue for inbound chat", "A new chat channel never reaches agents. The queue list has a fresh queue and no digital skill.", "create routingQueue name=Chat_In status=blocked\nhelp=cannot create new routing queues", "New inbound digital routing is skills and scripts. The product still syncs old queues with skills, but you do not start there.", "Create a digital ACD skill and a digital script, then assign both as the defaults on the digital point of contact.", "digitalSkills"),
        ],
      }),
      lesson({
        id: "tenant-shape",
        title: "Tenant, business unit, and campaign",
        level: "foundation",
        minutes: 11,
        summary: "A tenant is the high-level grouping for support, billing, and global settings. Skills are created inside a campaign. API calls then discover which area that tenant lives in.",
        objectives: ["Place tenant above campaign and skill", "See why an API user is an employee", "Know that base URLs are per tenant"],
        figure: row("From tenant down to skill", [
          { id: "t", label: "Tenant", sub: "billing, global", tone: 1 },
          { id: "b", label: "Business unit", sub: "ACD config", tone: 2 },
          { id: "c", label: "Campaign", sub: "holds skills", tone: 3 },
          { id: "k", label: "Skill", sub: "routes contacts", tone: 4 },
        ], [
          { from: "t", to: "b", label: "contains" },
          { from: "b", to: "c", label: "operates" },
          { from: "c", to: "k", label: "groups" },
        ]),
        sections: [
          sec("What Admin calls a tenant", [
            "The Admin welcome page describes a tenant as the high-level organizational grouping used to manage technical support, billing, and global settings for your NiCE CXone system. Roles and permissions live here. So do employee profiles.",
            "When you create an inbound phone skill, the skill form asks for a campaign. The skill belongs to that campaign. The campaign is not the tenant, and it is not the point of contact.",
          ], ["admin", "inbound"]),
          sec("The same tenant shows up in an API token", [
            "Getting Started tells you to pull tenantId from the ID token, then call the issuer's /.well-known/cxone-configuration with that tenant id. The reply includes area, domain, and api_endpoint. The published example uses area na1 and api_endpoint https://api-na1.niceincontact.com.",
            "A multi-tenant app must not hard-code na1. The page says the base URL should be built dynamically per tenant.",
          ], ["gettingStarted"]),
        ],
        flow: flow("Discover the API host for a tenant", ["App", "Issuer", "Token", "Discovery", "API"], [
          step("App", "Issuer", "OpenID discovery", "Global issuer is https://cxone.niceincontact.com.", { path: "/.well-known/openid-configuration" }),
          step("App", "Token", "Password grant for a back-end app", "Username is the access key id. Password is the secret.", { grant_type: "password" }),
          step("Token", "Discovery", "Read tenantId", "The ID token carries tenantId.", { claim: "tenantId" }),
          step("Discovery", "API", "Build the host", "GET {issuer}/.well-known/cxone-configuration?tenantId=", { example: "api-na1.niceincontact.com" }),
        ]),
        quiz: [
          q("What is a tenant, in the Admin welcome page's words?", ["The high-level grouping for technical support, billing, and global settings", "A single ACD skill", "A Studio script", "An agent's station"], 0, "That sentence is on the users, data access, and security page.", "admin"),
          q("Where do you put a new inbound phone skill?", ["In a campaign you select on the skill", "Directly on the tenant with no campaign", "On the point of contact only", "Inside a login authenticator"], 0, "Set Up Inbound Voice says to select the campaign the skill belongs to.", "inbound"),
          q("Which claim in the ID token do you pass to CXone discovery?", ["tenantId", "icAgentId only", "The refresh token as a query string", "The client secret"], 0, "Getting Started says to use the tenantId field from the ID token.", "gettingStarted"),
          q("What is the global production issuer named on Getting Started?", ["https://cxone.niceincontact.com", "https://api-na1.niceincontact.com", "https://help.nicecxone.com", "https://cxone-gov.niceincontact.com for every customer"], 0, "The FedRAMP issuer is separate: https://cxone-gov.niceincontact.com.", "gettingStarted"),
          q("May a productized app hard-code https://api-na1.niceincontact.com for every customer?", ["No. Build api-{area}.{domain} from discovery for that tenant.", "Yes. Every tenant is na1.", "Yes, if the client id matches.", "Only government tenants use discovery."], 0, "The page says the area may change across tenants and the base URL should be dynamic.", "gettingStarted"),
          q("The published discovery example returns which api_endpoint?", ["https://api-na1.niceincontact.com", "https://cxone.niceincontact.com/auth/token", "https://api.nice.com", "An empty string"], 0, "That is the example body on Getting Started. Your tenant can differ.", "gettingStarted"),
        ],
        cards: [
          card("Tenant", "Top grouping for support, billing, and global settings."),
          card("Campaign", "The container you pick when you create a skill."),
          card("tenantId", "Claim you send to /.well-known/cxone-configuration."),
          card("api-{area}.{domain}", "Pattern for the API base URL. Example area: na1."),
        ],
        lab: lab("Sketch one tenant two ways", "Connect the admin tree to the API discovery tree.", [
          "Draw Tenant, then a campaign, then two skills, then a point of contact under one skill.",
          "Beside it, draw Issuer, token, tenantId, and api_endpoint.",
          "Write the global issuer and the FedRAMP issuer on the API side.",
          "Circle the only value that is allowed to differ per customer on a multi-tenant app: area and domain from discovery.",
        ], "You can explain why na1 in the example is not a universal host."),
        faults: [
          fault("Hard-coded na1 on a second tenant", "A second customer's integration receives 401 or HTML from the wrong host after a token that looks valid.", "discovery tenantId=11eb… area=eu1 api_endpoint=https://api-eu1.niceincontact.com\napp still calls https://api-na1.niceincontact.com", "The sample in the docs is na1. The page tells you to construct the host from the tenant's own discovery document.", "Cache the discovered api_endpoint per tenant and refresh it. Do not ship the example host as a constant.", "gettingStarted"),
        ],
        uncertain: ["Business unit appears on ACD screens such as ACD Configuration > Business Units. This lesson treats it as the operating ACD container inside the tenant. The Admin welcome page defines tenant, not a separate glossary entry that contrasts business unit and tenant."],
      }),
      lesson({
        id: "prereq-network",
        title: "Browser, WebRTC, and allowlists",
        level: "foundation",
        minutes: 12,
        summary: "Integrated Softphone is the NiCE application. WebRTC is the Chrome technology it uses. Those names are not interchangeable, and Integrated Softphone has an IP allowlist.",
        objectives: ["Separate Integrated Softphone from WebRTC", "Name the installable Softphone", "Know an allowlist exists"],
        figure: row("Two agent-leg options", [
          { id: "a", label: "Agent app", sub: "MAX or Workspace", tone: 1 },
          { id: "i", label: "Integrated", sub: "nothing to install", tone: 4 },
          { id: "w", label: "WebRTC", sub: "Chrome technology", tone: 3 },
          { id: "s", label: "Softphone", sub: "installed app", tone: 2 },
        ], [
          { from: "a", to: "i", label: "uses" },
          { from: "i", to: "w", label: "built on" },
          { from: "a", to: "s", label: "or" },
        ]),
        sections: [
          sec("The connectivity page draws a hard line", [
            "If the agent leg is VoIP, NiCE CXone offers two softphone options. Integrated Softphone is built into the platform, so there is nothing to install on the agent computer. Softphone is a separate application that must be installed.",
            "The same page says Integrated Softphone is sometimes called WebRTC, and that the two names do not refer to the same thing. WebRTC is the communications technology available in the Chrome web browser. It is what the application called Integrated Softphone uses.",
          ], ["connectivity"]),
          sec("Allowlists and what this lab will not invent", [
            "The connectivity page says that if you use Integrated Softphone, there are IP addresses that must be added to your allowlist. The page should be opened for the current list. This lab does not copy a list that can change.",
            "PSTN, on that page, is any phone traffic routed via DID or toll-free number. VoIP transports calls over the internet and needs a VoIP phone or a softphone. A SIP trunk is defined there as a virtual connection that lets a PBX communicate with a carrier network, using a phone line, VoIP, or a dedicated connection such as MPLS.",
          ], ["connectivity"]),
        ],
        flow: flow("Agent leg chooses a softphone", ["Contact", "CXone", "Agent app", "Media"], [
          step("Contact", "CXone", "Call arrives on a TFN", "The contact leg can be PSTN.", { class: "DID or TFN" }),
          step("CXone", "Agent app", "Offer the contact", "The agent application rings.", { app: "Agent Workspace" }),
          step("Agent app", "Media", "Integrated Softphone", "No install. The app uses WebRTC in Chrome.", { allowlist: "required" }),
          step("Agent app", "Media", "Or installed Softphone", "A separate application on the computer.", { install: "yes" }),
        ]),
        quiz: [
          q("What is Integrated Softphone?", ["The NiCE application built into the platform, with nothing to install", "A synonym for any SIP trunk", "The public switched telephone network", "A carrier you order from NiCE"], 0, "Connectivity in NiCE CXone defines it that way.", "connectivity"),
          q("What is WebRTC, on that same page?", ["The communications technology in Chrome that Integrated Softphone uses", "The installed Softphone product", "A SIP trunk type", "A Digital Experience channel"], 0, "The page says the two names do not refer to the same thing.", "connectivity"),
          q("What does the installed Softphone require?", ["An application installed on the agent computer", "Nothing; it is the same as Integrated Softphone", "A DID for every agent", "An Avaya CMS connector"], 0, "The page contrasts it with Integrated Softphone.", "connectivity"),
          q("How does the page classify DID and toll-free traffic?", ["As PSTN", "As WebRTC", "As a digital skill", "As MPLS only"], 0, "PSTN is any phone traffic routed via DID or TFN.", "connectivity"),
          q("What must you do for Integrated Softphone besides turning it on?", ["Add IP addresses to the allowlist", "Disable Chrome", "Install the separate Softphone as well", "Set Personal Connection acceleration to 1"], 0, "The connectivity page states the allowlist requirement. Fetch the current addresses from that page.", "connectivity"),
          q("A SIP trunk, in the page's definition, connects what?", ["A PBX and a carrier network", "Two ACD skills", "A CRM and AutoSummary", "A WFM forecast and a schedule"], 0, "It can ride a phone line, VoIP, or a dedicated connection such as MPLS.", "connectivity"),
        ],
        cards: [
          card("Integrated Softphone", "In-platform agent audio. Nothing to install. Uses WebRTC."),
          card("WebRTC", "The browser technology. Not the product name."),
          card("Softphone", "The separate installable application."),
          card("PSTN", "DID or toll-free traffic, in NiCE's classification."),
        ],
        lab: lab("Label a desk", "Decide which object is the product and which is the browser feature.", [
          "On a diagram of an agent laptop, write Integrated Softphone on the CXone application window.",
          "Write WebRTC on the browser, and write Chrome next to it because that is the browser the help page names.",
          "Add a second laptop where Softphone is an installed application instead.",
          "Add a firewall box labeled allowlist, with an arrow only from the Integrated Softphone laptop.",
        ], "You can correct someone who says 'we use WebRTC' when they mean the product, or the reverse."),
        faults: [
          fault("Agents silent after a firewall change", "Integrated Softphone rings and then fails. Installed Softphone users on another floor are fine.", "agentLeg=IntegratedSoftphone media=failed\nfirewall change=last night\nallowlist=not updated", "The connectivity page requires IP addresses on the allowlist for Integrated Softphone. A new firewall rule can drop that path without touching the installed Softphone.", "Compare the current allowlist on the connectivity help page with the firewall. Do not treat this as a carrier outage until that list is checked.", "connectivity"),
        ],
        uncertain: ["The connectivity page names Chrome when it defines WebRTC. It does not, in the passage used here, publish a full browser support matrix. Do not turn that sentence into 'only Chrome works' without reading the current requirements page."],
      }),
      lesson({
        id: "sip-pstn",
        title: "SIP, in the language CXone and the RFC share",
        level: "foundation",
        minutes: 14,
        summary: "RFC 3261 is the SIP specification. NiCE's connectivity page uses SIP trunk as a virtual PBX-to-carrier connection. The lab does not invent CXone SIP headers that the help page does not list.",
        objectives: ["Cite RFC 3261 for SIP itself", "Use NiCE's SIP trunk definition", "Refuse to invent header behavior"],
        figure: row("Where SIP shows up", [
          { id: "r", label: "RFC 3261", sub: "the protocol", tone: 3 },
          { id: "t", label: "SIP trunk", sub: "PBX to carrier", tone: 2 },
          { id: "c", label: "CXone", sub: "voice edge", tone: 1 },
          { id: "a", label: "Agent leg", sub: "VoIP softphone", tone: 4 },
        ], [
          { from: "r", to: "t", label: "defines SIP" },
          { from: "t", to: "c", label: "carrier path" },
          { from: "c", to: "a", label: "separate leg" },
        ]),
        sections: [
          sec("Keep the RFC and the product page apart", [
            "SIP is specified in RFC 3261. That document is the place to learn INVITE, responses, and dialogs. NiCE's connectivity page does not reprint the RFC. It defines a SIP trunk as a virtual connection that allows a PBX to communicate with a carrier network.",
            "The agent leg is a different hop. It is Integrated Softphone or the installable Softphone. Mixing a SIP ladder from the carrier with a WebRTC agent leg is normal in a design, and it is a mistake to draw them as one protocol.",
          ], ["rfc3261", "connectivity"]),
          sec("What you can say in a design review", [
            "You can say the contact leg may arrive from the PSTN as a DID or toll-free call, and that a SIP trunk is one way a PBX reaches a carrier. You cannot, from the pages gathered for this lab, claim a specific CXone SIP header, codec list, or OPTIONS timer.",
            "When a design needs those values, open the current connectivity and telephony requirements pages and your carrier's build sheet. Mark anything else as unknown.",
          ], ["connectivity"]),
        ],
        flow: flow("Two legs, two explanations", ["Caller", "Carrier", "CXone", "Agent"], [
          step("Caller", "Carrier", "PSTN call", "DID or TFN, in NiCE's classification.", { leg: "contact" }),
          step("Carrier", "CXone", "SIP trunk or other", "The help page allows a traditional line, VoIP, or MPLS for a SIP trunk.", { protocol: "see RFC 3261 for SIP" }),
          step("CXone", "Agent", "VoIP agent leg", "Integrated Softphone or installed Softphone.", { not: "the same hop as the trunk" }),
          step("Agent", "CXone", "Answer", "The interaction is one conversation with two media legs.", { interaction: "voice" }),
        ]),
        quiz: [
          q("Which document specifies SIP?", ["RFC 3261", "RFC 6749", "The CXone priority formula page", "OpenID Connect Core"], 0, "RFC 6749 is OAuth 2.0. SIP is RFC 3261.", "rfc3261"),
          q("NiCE's connectivity page defines a SIP trunk as what?", ["A virtual connection between a PBX and a carrier network", "The agent WebRTC session", "A digital routing queue", "An access key"], 0, "It may use a phone line, VoIP, or a dedicated connection such as MPLS.", "connectivity"),
          q("Does this lab publish CXone's SIP OPTIONS interval?", ["No. That value was not taken from the cited pages.", "Yes. It is 30 seconds for every tenant.", "Yes. It is 5 seconds.", "It is the same as bullseye Music, 90 seconds."], 0, "Do not invent telephony timers.", "connectivity"),
          q("The agent leg and the carrier trunk are…", ["Different hops. Softphone options apply to the agent leg.", "Always the same SIP dialog.", "Both called Integrated Softphone.", "Both PSTN by definition."], 0, "Connectivity separates PSTN contact traffic from VoIP agent options.", "connectivity"),
          q("RFC 3261 is the right citation for which question?", ["How SIP as a protocol works", "How bullseye proficiency is numbered", "Which CRM objects AutoSummary writes", "The 26.3 release dates"], 0, "Use product help for product behavior and the RFC for the protocol.", "rfc3261"),
          q("A DID is classified on the connectivity page as…", ["PSTN", "A digital channel", "An API scope", "A WFM scheduling unit"], 0, "DID and TFN traffic is PSTN in that glossary.", "connectivity"),
        ],
        cards: [
          card("RFC 3261", "The SIP specification. Cite it for the protocol, not for CXone button names."),
          card("SIP trunk", "NiCE: a virtual PBX-to-carrier connection."),
          card("Contact leg", "How the caller reaches CXone. Often PSTN."),
          card("Agent leg", "How the agent hears the caller. Integrated or installed softphone."),
        ],
        lab: lab("Draw two legs and stop", "Practice not inventing headers.", [
          "Draw the caller, the carrier, CXone, and the agent.",
          "Label the carrier hop with 'SIP trunk — see connectivity page and RFC 3261'.",
          "Label the agent hop 'Integrated Softphone (WebRTC in Chrome)'.",
          "Leave a blank box called 'codec and timers' and write 'not in this lab's sources'.",
        ], "The diagram is honest about what you know."),
        faults: [
          fault("One ladder for two protocols", "A bridge document shows a single SIP INVITE from the carrier all the way to the agent's browser, and the allowlist work is skipped.", "design=single INVITE carrier→browser\nagentLeg=IntegratedSoftphone\nallowlist=missing", "The agent leg is not documented as the same SIP trunk. Integrated Softphone uses WebRTC and needs an allowlist.", "Split the picture into a carrier leg and an agent leg. Cite RFC 3261 only on the SIP leg.", "connectivity"),
        ],
      }),
      lesson({
        id: "numbers-that-matter",
        title: "AHT, service level, and the numbers routing serves",
        level: "foundation",
        minutes: 11,
        summary: "WFM forecasts volume and average handle time, then you choose a speed-of-answer target. A tighter target needs more agents. Routing features such as bullseye change who is eligible, which can change the forecast.",
        objectives: ["Define AHT the way the forecast page does", "Connect a service target to staffing", "Remember bullseye can disturb a forecast"],
        figure: row("Forecast before the schedule", [
          { id: "h", label: "History", sub: "volume and AHT", tone: 1 },
          { id: "f", label: "Forecast", sub: "expected work", tone: 2 },
          { id: "p", label: "Parameters", sub: "answer target", tone: 3 },
          { id: "s", label: "Staffing", sub: "people needed", tone: 4 },
        ], [
          { from: "h", to: "f", label: "models" },
          { from: "f", to: "p", label: "targets" },
          { from: "p", to: "s", label: "plan" },
        ]),
        sections: [
          sec("The forecast page's own example", [
            "General Forecast says you review historical data, and forecasting predicts volume and average handle time. AHT is defined there as the average length of time to complete a transaction from start to finish. You then decide how the center should perform. The page's example is answering or dialing each call in less than 10 seconds compared with 30 seconds.",
            "Lowering average speed of answer, or increasing dials, needs more agents. The last step is a staffing plan from the staffing parameters and the forecast data. Accurate results need at least three months of history, and the same page also recommends at least 13 weeks.",
          ], ["forecast"]),
          sec("Routing changes the work the forecast assumed", [
            "Bullseye routing widens or narrows who can take a contact. The bullseye page tells you to read your WFM product's guidance before you turn that on, because proficiency ranges and routing attributes can affect forecasting.",
            "Workforce Management (CXone) and Workforce Management (IEX Integrated) are different products. The bullseye page points CXone WFM users at the online help and IEX users at the Distribution Rules Guide.",
          ], ["bullseye", "wfm"]),
        ],
        flow: flow("From history to a staffing picture", ["History", "Forecast", "Parameters", "Staffing", "Schedule"], [
          step("History", "Forecast", "At least three months", "The page also recommends at least 13 weeks.", { output: "volume and AHT" }),
          step("Forecast", "Parameters", "Pick a target", "Example: under 10 seconds rather than 30.", { lever: "average speed of answer" }),
          step("Parameters", "Staffing", "Generate the plan", "Tighter targets need more people.", { step: "Generate Staffing Plan" }),
          step("Staffing", "Schedule", "Hand the plan to scheduling", "WFM scheduling uses this picture. Bullseye can change who actually answers.", { check: "WFM guidance" }),
        ]),
        quiz: [
          q("What does the forecast page say AHT measures?", ["Average length of time to complete a transaction, start to finish", "Only talk time, excluding hold and after-contact work, in all cases", "The priority number in the ACD formula", "Proficiency"], 0, "Use the page's definition. Do not swap in a different industry formula unless you label it.", "forecast"),
          q("The page's speed example compares which two targets?", ["Under 10 seconds and 30 seconds", "Under 20 seconds and 2 minutes", "Proficiency 1 and proficiency 20", "90 seconds of Music"], 0, "That is the worked example on General Forecast.", "forecast"),
          q("How much history does the page require for accurate results?", ["At least three months", "One day", "Ten years", "None; it is a guess"], 0, "It also recommends at least 13 weeks when you define the historical period. Both sentences are on the page.", "forecast"),
          q("A lower average speed of answer needs…", ["More agents scheduled", "Fewer agents", "Acceleration set to 0 on an inbound skill", "No forecast"], 0, "The page says lowering average speed of answer needs more agents.", "forecast"),
          q("Before bullseye, what does the bullseye page tell a CXone WFM customer to read?", ["The Workforce Management (CXone) online help", "Only the IEX Distribution Rules Guide", "RFC 3261", "The OAuth getting-started page"], 0, "IEX customers are pointed at the Distribution Rules Guide instead.", "bullseye"),
          q("Are CXone WFM and IEX WFM the same application?", ["No. The bullseye page treats them as different products with different guidance.", "Yes. IEX is the new name for CXone WFM.", "Yes. They share one forecast button.", "IEX is a CRM."], 0, "The WFM welcome page also points IEX Integrated users to help inside that application.", "wfm"),
        ],
        cards: [
          card("AHT", "Forecast page: average time to complete a transaction, start to finish."),
          card("Three months", "Minimum history the forecast page names for accurate results."),
          card("13 weeks", "The recommendation in the historical-period section of the same page."),
          card("Bullseye side effect", "Changing who is eligible can affect the forecast. Read the WFM guidance first."),
        ],
        lab: lab("Change only the target", "See why a service goal is a staffing decision.", [
          "Write a forecast of 100 contacts in an interval with an AHT you invent and label as a classroom number, not a NiCE benchmark.",
          "Write two columns: answer in 30 seconds, and answer in under 10 seconds.",
          "Under the 10-second column, write the help page's conclusion: more agents.",
          "Add a footnote: if bullseye later widens the pool, re-check the WFM guidance before you trust the old plan.",
        ], "You did not pretend the classroom volume was a product constant."),
        faults: [
          fault("Forecast ignored the new bullseye", "Service level collapses on Spanish after a script change. The forecast still assumes only proficiency 1–3 can answer.", "script REQAGENT high=1 low=3\nUpdateContact after 90s low=12\nforecast still staffs only the 1–3 group", "Bullseye changed the eligible pool. The bullseye page says to review WFM impact before you rely on the old staffing plan.", "Revisit the forecast with the WFM administrators and the proficiency range the script actually uses.", "bullseye"),
        ],
      }),
      lesson({
        id: "read-the-page",
        title: "How to read a help page and a release note",
        level: "foundation",
        minutes: 13,
        summary: "Major releases happen four times a year. Dates on the 26.3 and 26.4 pages do not line up cleanly. This lab marks that clash instead of smoothing it over.",
        objectives: ["Describe the release process", "Treat Coming Soon as a plan, not a promise", "Keep conflicting dates visible"],
        figure: row("What a release cycle publishes", [
          { id: "c", label: "Coming Soon", sub: "30 days before beta", tone: 2 },
          { id: "n", label: "Release notes", sub: "at beta", tone: 1 },
          { id: "b", label: "Beta", sub: "first clusters", tone: 3 },
          { id: "u", label: "Customers", sub: "two weeks later", tone: 4 },
        ], [
          { from: "c", to: "b", label: "30 days" },
          { from: "n", to: "b", label: "on or just before" },
          { from: "b", to: "u", label: "+ 2 weeks" },
        ]),
        sections: [
          sec("The process page", [
            "The release process page says a cycle runs from the Coming Soon notes until the release reaches the last customer cluster. Coming Soon notes are published 30 days before deployment to beta clusters. Final release notes and help updates publish on or shortly before beta. Customer clusters start two weeks after beta, a few clusters each week.",
            "Cumulative updates and pipeline updates occur on separate cadences, roughly every three weeks. Hotfixes ship when needed. Features marked 'available later in the release cycle' arrive in an update. The service notification page adds that a major release happens four times a year, and that deployment dates in notifications are not guaranteed.",
          ], ["releaseProcess", "notify"]),
          sec("Dates that disagree, left in view", [
            "The 26.2 notes say that cycle begins on 29 April 2026 and ends when the next release begins, then targeted for 28 July 2026. The 26.3 notes say the cycle was first planned for 3 August 2026 through 25 October 2026, then moved, because of a change moratorium, to 2 September 2026 through 5 November 2026.",
            "The 26.4 Coming Soon page says that cycle begins on 26 October 2026 and the next release is targeted for 4 February 2027. Those 26.3 and 26.4 windows overlap. Both pages say features are subject to change. This lab does not pick a winner.",
          ], ["rel262", "rel263", "rel264"]),
        ],
        flow: flow("A feature moves from Coming Soon to a cluster", ["NiCE", "Coming Soon", "Beta", "Your cluster"], [
          step("NiCE", "Coming Soon", "Publish the plan", "At least 30 days before beta, per the process page.", { status: "planned" }),
          step("Coming Soon", "Beta", "Notes finalize", "Final notes publish on or shortly before beta.", { license: "may be required" }),
          step("Beta", "Your cluster", "Two weeks, then groups", "Not every tenant gets the feature on beta day.", { cadence: "a few clusters a week" }),
          step("Your cluster", "Your cluster", "Later in the cycle", "Some features wait for a cumulative update.", { example: "CU" }),
        ]),
        quiz: [
          q("How often does a major release occur, according to the notification timeline?", ["Four times a year", "Every week", "Once a year", "Only when you open a support case"], 0, "The service notification timeline says a major release is four times a year.", "notify"),
          q("When are Coming Soon notes published?", ["30 days before deployment to beta clusters", "The morning of your cluster's maintenance", "After the last customer cluster", "They are not part of the process"], 0, "That interval is on the release process page.", "releaseProcess"),
          q("When do customer clusters start, relative to beta?", ["Two weeks after beta, then in groups", "The same hour as beta, worldwide", "Six months later", "Only after a hotfix"], 0, "The process page says deployment to customer clusters begins two weeks after beta.", "releaseProcess"),
          q("The 26.3 page's revised end date is…", ["5 November 2026", "28 July 2026", "4 February 2027", "29 April 2026"], 0, "The page says the cycle will now end on 5 November 2026, after a moratorium moved the original plan.", "rel263"),
          q("The 26.4 Coming Soon page says that cycle begins on…", ["26 October 2026", "2 September 2026", "29 April 2026", "11 June 2025"], 0, "That date overlaps the 26.3 end date published on the other page. Marked as a documentation clash, not resolved here.", "rel264"),
          q("Are deployment dates in service notifications guaranteed?", ["No. The notification timeline says they are not guaranteed.", "Yes. They are contractual.", "Only cumulative updates are guaranteed.", "Only the 26.4 dates are guaranteed."], 0, "If a date moves, the page describes the notice you should get.", "notify"),
        ],
        cards: [
          card("Coming Soon", "Published 30 days before beta. A plan, and the page says plans can change."),
          card("Beta then customers", "Customer deployment starts two weeks after beta."),
          card("Four majors a year", "From the service notification timeline."),
          card("26.3 vs 26.4", "Published windows overlap. Do not invent a merged calendar."),
        ],
        lab: lab("Build a date card and a doubt card", "Practice leaving a conflict visible.", [
          "Write the 26.2, 26.3, and 26.4 dates on three cards, each with its URL.",
          "On a fourth card, write the overlap between 5 November 2026 and 26 October 2026.",
          "Do not 'fix' the overlap. Write 'subject to change on both pages'.",
          "Add the process rule: your cluster is not necessarily the beta cluster.",
        ], "You can brief a change window without pretending the help pages agree."),
        faults: [
          fault("A change frozen to the wrong Thursday", "A cutover is booked for 28 July 2026 because someone treated the 26.2 'targeted' next-release date as the 26.3 start, and the moratorium move is missed.", "plan=upgrade on 2026-07-28\nsource=26.2 notes 'targeted'\n26.3 page=2 Sep 2026 to 5 Nov 2026 after moratorium", "Targeted dates move. The 26.3 page documents a moratorium that already moved that cycle.", "Re-read the current 26.3 and 26.4 pages the week you schedule, and subscribe to service notifications.", "rel263"),
        ],
        uncertain: ["The French 25.4 release notes say that cycle starts 29 October 2025 and that the next release was then targeted for 29 January 2026. An English 25.4 page was not the one retrieved for this lesson, so that pair of dates stays marked uncertain for English wording."],
      }),
    ],
  },
];
