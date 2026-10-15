import { quick, row, rings, flow, step } from "./shape.mjs";
function track(id, title, blurb, accent, lessons) { return { id, title, blurb, accent, lessons }; }

export const part3 = [
  track("acd", "ACD setup", "The inbound voice path: skill, script, DNIS, and the point of contact that binds them.", 3, [
    quick({
      id: "inbound-order",
      title: "The inbound voice order",
      level: "foundation", minutes: 12,
      summary: "Set Up Inbound Voice builds a phone skill, a phone script, and a point of contact, in that order. The DNIS already has to exist.",
      objectives: ["Follow the published order", "Name the permissions", "Leave the DNIS to Professional Services"],
      figure: row("Setup order", [
        { id: "d", label: "DNIS", sub: "already in tenant", tone: 2 },
        { id: "k", label: "Skill", sub: "Phone Call", tone: 4 },
        { id: "s", label: "Script", sub: "Studio phone", tone: 3 },
        { id: "p", label: "POC", sub: "binds them", tone: 1 },
      ], [{ from: "d", to: "p", label: "select" }, { from: "k", to: "p", label: "one" }, { from: "s", to: "p", label: "one" }]),
      sections: [
        ["What the page tells you to create", [
          "Set Up Inbound Voice says to create an inbound phone ACD skill with Media Type Phone Call and direction Inbound, pick a campaign, and name the skill. Permissions are ACD > Skills Create, Edit.",
          "You then create a phone script. The page says to add BEGIN and REQAGENT and connect them. Inbound calls route to the skill on the point of contact unless you change the Skill property on REQAGENT. An IVR, if you want one, is added in the script, and the page says you may need your account representative for guidance.",
        ], ["inbound"]],
        ["Then the point of contact", [
          "Create the POC in ACD under Contact Settings > Points of Contact, media type Phone Call. Choose the DNIS from the drop-down of numbers already configured with NiCE. Select the skill and the script. IVR Reporting Enabled is how that number tracks IVR press paths.",
          "The points of contact overview adds the prerequisite the setup page assumes: Professional Services configures the phone number before you can build a POC for it.",
        ], ["inbound", "poc"]],
      ],
      flow: flow("Stand up one inbound number", ["PS", "ACD", "Studio", "POC"], [
        step("PS", "ACD", "DNIS exists", "You cannot invent the number in the POC drop-down.", { owner: "Professional Services" }),
        step("ACD", "ACD", "Create the skill", "Phone Call, Inbound, campaign, name.", { permission: "Skills Create, Edit" }),
        step("Studio", "Studio", "BEGIN to REQAGENT", "Skill property only if you are leaving the POC default.", { actions: "BEGIN, REQAGENT" }),
        step("POC", "POC", "Bind number, skill, script", "Optional: IVR Reporting Enabled.", { count: "one skill, one script" }),
      ]),
      quiz: [
        ["Media type for an inbound voice skill?", ["Phone Call", "Digital", "Work item", "Chat"], 0, "Set Up Inbound Voice says Phone Call and Inbound.", "inbound"],
        ["Which permission does that page name for the skill?", ["ACD > Skills Create, Edit", "Admin > Access Keys only", "WFM > Forecasting", "No permission"], 0, "The page lists it under the skill procedure.", "inbound"],
        ["Who configures the phone number before the POC?", ["Professional Services", "The agent's browser", "The Menu action", "AutoSummary"], 0, "The POC overview says the DNIS must already be configured.", "poc"],
        ["What does the POC skill do if REQAGENT does not name a different skill?", ["It is the skill the call routes to", "It is ignored", "It sets the agent's proficiency", "It creates a routing queue"], 0, "The setup page says calls route to the POC skill unless you change REQAGENT.", "inbound"],
        ["IVR Reporting Enabled does what?", ["Tracks IVR press paths for that number", "Records the agent's screen", "Disables the script", "Sets acceleration to 0"], 0, "It is a checkbox on the point of contact.", "inbound"],
        ["BEGIN and REQAGENT are the two actions the setup page tells you to add first.", ["True", "False", "Only for digital", "Only for Personal Connection"], 0, "The page names those two actions and says to connect them.", "inbound"],
      ],
      cards: [
        ["Phone Call / Inbound", "The media type and direction for this skill."],
        ["DNIS first", "Professional Services configures the number."],
        ["REQAGENT skill", "Blank means the POC skill. Set it to retarget."],
        ["IVR Reporting Enabled", "POC checkbox for press-path reporting."],
      ],
      lab: ["Write the order on a card", "Five lines, no extra products.", [
        "Line 1: confirm the DNIS exists.",
        "Line 2: create the Phone Call inbound skill in a campaign.",
        "Line 3: BEGIN connected to REQAGENT.",
        "Line 4: POC selects DNIS, skill, and script.",
      ], "You can hand the card to someone who has never opened ACD."],
      faults: [
        ["Empty DNIS drop-down", "The POC form has no phone number to select.", "POC create media=Phone Call\nPoint of Contact drop-down=empty\ncarrier order=placed yesterday", "The overview says Professional Services must configure the DNIS before the POC.", "Stop the POC work and confirm the number is built in the tenant. Do not type a free-text number the form does not offer.", "poc"],
      ],
    }),
    quick({
      id: "skill-fields",
      title: "Skill name, campaign, and direction",
      level: "foundation", minutes: 10,
      summary: "A skill has a media type, a direction, a name, and a campaign. Priority fields, including acceleration, live on the skill and are not the same thing as proficiency.",
      objectives: ["Fill the required skill fields", "Keep priority separate from proficiency", "Use the documented priority formula later, not here"],
      figure: row("What a skill record holds", [
        { id: "n", label: "Name", sub: "Sales_IB", tone: 1 },
        { id: "m", label: "Media", sub: "Phone Call", tone: 4 },
        { id: "c", label: "Campaign", sub: "container", tone: 2 },
        { id: "p", label: "Priority", sub: "initial + acceleration", tone: 3 },
      ], [{ from: "c", to: "n", label: "contains" }, { from: "n", to: "m", label: "typed" }, { from: "n", to: "p", label: "optional" }]),
      sections: [
        ["The create form", [
          "Create New > Single Skill. Media Type Phone Call. Inbound/Outbound set to Inbound. Enter a skill name. Select the campaign. The page says the remaining Skill Information fields are optional.",
          "Priority is one of those later fields. The static delivery page defines Initial Priority, Acceleration, and Maximum Priority. Overall Priority = (Time × Acceleration) + Initial Priority. That math is not the skill's name and not the agent's proficiency.",
        ], ["inbound", "priority"]],
        ["Proficiency is on the agent assignment", [
          "Bullseye says that when you assign an agent to a skill you also set proficiency, from 1 to 20, where 1 is best and 20 is worst. You can set it on the ACD user profile or on the skill record.",
          "A skill without agents, or agents without a proficiency you intended, will not match the window your script requests. The skill can exist and still deliver to nobody.",
        ], ["bullseye"]],
      ],
      flow: flow("Create the skill, then staff it", ["ACD", "Campaign", "Skill", "Agent"], [
        step("ACD", "Campaign", "Pick the container", "The skill form requires a campaign.", { field: "Campaign" }),
        step("Campaign", "Skill", "Name and media", "Phone Call, Inbound.", { optional: "the rest of Skill Information" }),
        step("Skill", "Skill", "Priority later", "Initial, acceleration, maximum. Formula uses minutes.", { example: "4 + 1 per minute = 7 at 3 min" }),
        step("Skill", "Agent", "Assign proficiency", "1 best, 20 worst.", { where: "user profile or skill record" }),
      ]),
      quiz: [
        ["Which fields does the inbound page treat as the core of a new skill?", ["Media type, direction, name, and campaign", "SIP OPTIONS timer and codec", "A client secret", "A routing queue id"], 0, "Other Skill Information fields are optional on that page.", "inbound"],
        ["Overall priority equals…", ["(Time × Acceleration) + Initial Priority", "Proficiency × idle time", "HighProficiency − LowProficiency", "AHT × agents"], 0, "The static delivery page states the formula. Time is what makes a contact age.", "priority"],
        ["Initial 4 and acceleration 1, after three minutes, is priority…", ["7", "4", "12", "43"], 0, "The page's own example: priority rises by one per minute and is 7 after three minutes.", "priority"],
        ["Proficiency 1 means…", ["Best", "Worst", "Offline", "Digital only"], 0, "1 is best and 20 is worst. The scale is easy to invert.", "bullseye"],
        ["Where can proficiency be assigned?", ["On the ACD user profile or the skill record", "Only in Studio", "Only in WFM", "Only on the POC"], 0, "The bullseye page says either place.", "bullseye"],
        ["Acceleration and proficiency are the same setting.", ["False", "True", "Only for chat", "Only when maximum priority is 0"], 0, "One ages the contact. The other scores the agent.", "priority"],
      ],
      cards: [
        ["Campaign", "Required container for the skill."],
        ["Priority formula", "(Time × Acceleration) + Initial Priority."],
        ["Worked example", "Initial 4, acceleration 1, three minutes → 7."],
        ["1 is best", "Proficiency runs 1 through 20."],
      ],
      lab: ["Compute two priorities", "Use only the published formula.", [
        "Skill A: initial 4, acceleration 1, age 3 minutes. Write 7.",
        "Skill B: initial 4, acceleration 1, age 0.5 minutes. Write 4.5, because the page says priority rises by 0.5 after 30 seconds when acceleration is 1.",
        "Do not convert those numbers into proficiency.",
        "Note the page's second story, where Skill B is said to start at priority 4 from an initial of 3. That sentence does not match a strict reading of the formula. Leave it marked uncertain.",
      ], "Your arithmetic matches the formula and the three-minute example."],
      faults: [
        ["Best agents set to 20", "The most senior agents never take the opening bullseye window of 1–5.", "proficiency senior=20 junior=1\nREQAGENT high=1 low=5", "The author inverted the scale. 1 is best.", "Rescore the agents and keep 1 as best.", "bullseye"],
      ],
      uncertain: ["The static delivery page says Skill B with initial priority 3 starts 'at a priority of 4' before acceleration, while the formula on the same page yields 3 at time zero. The three-minute example (4, acceleration 1, result 7) matches the formula. Do not teach the 'priority of 4' sentence as arithmetic until you re-read the live page."],
    }),
    quick({
      id: "poc-bind",
      title: "Bind the point of contact",
      level: "foundation", minutes: 10,
      summary: "The point of contact is the only object that joins a specific number to one skill and one script. Reporting for IVR presses is a flag on that object.",
      objectives: ["Create a single POC", "Select an existing DNIS", "Decide on IVR reporting"],
      figure: row("One POC, three pointers", [
        { id: "n", label: "DNIS", sub: "the number", tone: 2 },
        { id: "k", label: "Skill", sub: "exactly one", tone: 4 },
        { id: "s", label: "Script", sub: "exactly one", tone: 3 },
        { id: "r", label: "IVR flag", sub: "press paths", tone: 1 },
      ], [{ from: "n", to: "k", label: "POC" }, { from: "n", to: "s", label: "POC" }, { from: "s", to: "r", label: "optional" }]),
      sections: [
        ["The create steps", [
          "App selector, ACD, Contact Settings, Points of Contact, Create New, Single Point of Contact. Media type Phone Call. Name it. Pick the DNIS. Pick the skill you created. Pick the script. Optionally enable IVR reporting. Create.",
          "Permission on that page: ACD > Contact Settings > Points of Contact Create.",
        ], ["inbound"]],
        ["Sharing is across POCs, not inside one", [
          "Several numbers can point at the same script when the menu is the same and the default skill differs, or the reverse. Each row is still one skill and one script.",
          "Email POCs use an email address instead of a DNIS. Digital POCs are created under Digital > Points of Contact and use the digital channel you choose. Do not build a chat channel on the phone POC form.",
        ], ["poc"]],
      ],
      flow: flow("Save the POC", ["Admin-ACD", "DNIS", "Skill", "Script"], [
        step("Admin-ACD", "DNIS", "Open the drop-down", "Only configured numbers appear.", { permission: "Points of Contact Create" }),
        step("DNIS", "Skill", "Select one", "This is the default the script starts from.", { cardinality: "1" }),
        step("Skill", "Script", "Select one", "Phone script for a phone POC.", { cardinality: "1" }),
        step("Script", "Script", "IVR reporting", "Turn it on only if you need press-path reports.", { flag: "IVR Reporting Enabled" }),
      ]),
      quiz: [
        ["POC create permission on the inbound page?", ["ACD > Contact Settings > Points of Contact Create", "Studio > Admin", "WFM > Schedule", "None"], 0, "The page prints the permission above the steps.", "inbound"],
        ["How many scripts on one phone POC?", ["One", "One per menu option", "Unlimited", "Zero; the skill is enough"], 0, "The overview is unambiguous.", "poc"],
        ["IVR press-path reporting is enabled where?", ["On the point of contact", "On the agent's proficiency", "In the OAuth client", "On the SIP trunk only"], 0, "The checkbox is IVR Reporting Enabled.", "inbound"],
        ["A digital channel POC is created where?", ["ACD, Digital, Points of Contact", "On the phone POC form with media type Phone Call", "In WFM", "In the carrier portal only"], 0, "The overview separates digital POCs from phone POCs.", "poc"],
        ["Two numbers, one script: allowed?", ["Yes", "No", "Only if both are digital", "Only for outbound"], 0, "Multiple POCs can share a script.", "poc"],
        ["The DNIS drop-down is free text.", ["False. You select a configured number.", "True", "True for toll-free only", "True after hours"], 0, "The setup page says to select the DNIS you configured earlier.", "inbound"],
      ],
      cards: [
        ["Single Point of Contact", "The create option for one number."],
        ["One and one", "One skill, one script, per POC."],
        ["IVR Reporting Enabled", "Press-path reporting for that number."],
        ["Digital POC", "A different list: Digital > Points of Contact."],
      ],
      lab: ["Fill a POC card for two numbers", "Share the script, split the default skill.", [
        "Number A: skill Main_IB, script Main, IVR reporting on.",
        "Number B: skill Main_IB, same script, IVR reporting off.",
        "Rewrite B so its default skill is Billing_IB while the script stays Main.",
        "Confirm you never put two skills on A.",
      ], "Both rows are legal POC rows."],
      faults: [
        ["Chat built as a phone POC", "A web chat widget has no path because the only POC is a phone number.", "POC media=Phone Call name=WebChat\nchannel wanted=chat", "Chat in Digital Experience is a digital point of contact with a digital skill and a digital script.", "Create the channel under Digital > Points of Contact.", "poc"],
      ],
    }),
    quick({
      id: "hours-and-closed",
      title: "Hours, closed paths, and what this lab will not invent",
      level: "intermediate", minutes: 10,
      summary: "The inbound page says you may add an IVR in the script and that you may need an account representative. It does not, in the passage used here, document an hours action field by field. Closed treatment has to be designed, and unknown actions stay marked unknown.",
      objectives: ["Keep undocumented actions out of a design", "Plan a closed path as a product question", "Use Menu only for what Menu's page says"],
      figure: row("Open path and a question mark", [
        { id: "b", label: "BEGIN", sub: "documented", tone: 4 },
        { id: "m", label: "MENU", sub: "documented", tone: 1 },
        { id: "r", label: "REQAGENT", sub: "documented", tone: 3 },
        { id: "h", label: "Closed?", sub: "confirm on help", tone: 2 },
      ], [{ from: "b", to: "m", label: "open" }, { from: "m", to: "r", label: "choice" }, { from: "b", to: "h", label: "unknown" }]),
      sections: [
        ["Stay on the pages you have", [
          "The basic script tutorial builds a menu, requests an agent, and plays hold music until the agent answers. The Menu page says the action plays a prompt and stores the contact's entry in a variable you name.",
          "An hours or holiday branch is a real contact-center need. This lab does not invent the Studio action name, properties, or branch labels for hours of operation. Look up the current action page before you put one in a design, and treat any remembered property list as uncertain.",
        ], ["basicScript", "menu"]],
        ["What you can still specify", [
          "You can specify the experience you want: a closed prompt, no queue, and a hang-up or a callback offer. You then map that experience onto actions the current help actually documents.",
          "Virtual hold, as the Studio product page describes it, disconnects the caller and creates a callback when an agent is available. That is a product claim on the Studio integration page, not a field list.",
        ], ["studioInt"]],
      ],
      flow: flow("Separate the known script from the open question", ["Caller", "BEGIN", "MENU", "Queue"], [
        step("Caller", "BEGIN", "Script starts", "The tutorial starts at BEGIN.", { known: "yes" }),
        step("BEGIN", "MENU", "Prompt and digit", "Stored in the variable you name.", { known: "yes" }),
        step("MENU", "Queue", "REQAGENT per branch", "Each branch names the skill for that destination.", { known: "yes" }),
        step("BEGIN", "BEGIN", "Closed path", "Design the experience. Confirm the action on the current help page.", { known: "no" }),
      ]),
      quiz: [
        ["Does this lab document a Hours action property list?", ["No. It tells you to open the current action page.", "Yes. Hours has a single property called Offset.", "Yes. It is the same as acceleration.", "Hours is an RFC."], 0, "Undocumented properties are marked unknown.", "basicScript"],
        ["What does Menu store?", ["The contact's entry, in a variable you name", "The agent's proficiency", "The access key", "The forecast"], 0, "The Menu page describes the Variable property.", "menu"],
        ["Virtual hold, on the Studio integration page, means…", ["Disconnect and call back when an agent is free", "A longer Music action only", "A CRM ticket", "An OAuth scope"], 0, "The page describes it that way. It does not list properties there.", "studioInt"],
        ["The basic tutorial's queue treatment is…", ["Reqagent, then hold music until answer", "Hang up immediately", "A routing queue", "A WFM bid"], 0, "Develop a Basic Script says play hold music until an agent answers.", "basicScript"],
        ["BEGIN is…", ["The start of the tutorial script", "An API scope", "A proficiency value", "A carrier"], 0, "The tutorial starts there.", "basicScript"],
        ["A closed-path design without a cited action should be labeled…", ["Unconfirmed", "Production-ready", "RFC 3261 compliant", "Bullseye"], 0, "Honesty is the point of the uncertainty rule.", "studioInt"],
      ],
      cards: [
        ["Known", "BEGIN, MENU, REQAGENT, Music, Wait, from the tutorial and action pages."],
        ["Unknown", "Hours-action fields. Look them up. Do not recite them from memory."],
        ["Virtual hold", "Product page: disconnect and callback when an agent is free."],
        ["Variable", "Menu stores the digits or the spoken choice here."],
      ],
      lab: ["Mark a script honest", "Green for cited actions, amber for the rest.", [
        "Sketch BEGIN, MENU, three REQAGENT branches, MUSIC, WAIT.",
        "Add a dashed box 'after hours' with no action name inside.",
        "Write the help URL you still need to open.",
        "Do not fill the dashed box from memory.",
      ], "The dashed box is still empty, on purpose."],
      faults: [
        ["Holiday branch from memory", "A script uses an action property that does not exist on the current help page, and New Year's calls enter the queue.", "action=Hours property=HolidayList value=NYD\nhelp page=property not found", "The property was remembered, not cited.", "Open the current action help and rebuild the branch from that page.", "basicScript"],
      ],
    }),
    quick({
      id: "script-on-poc",
      title: "The script the POC actually runs",
      level: "foundation", minutes: 9,
      summary: "A beautiful script that is not selected on the point of contact does not run. The POC holds exactly one script name.",
      objectives: ["Select the script on the POC", "Retarget skills inside the script", "Notice a script that is merely saved"],
      figure: row("Saved is not assigned", [
        { id: "a", label: "Script A", sub: "saved", tone: 2 },
        { id: "b", label: "Script B", sub: "on the POC", tone: 4 },
        { id: "p", label: "POC", sub: "one name", tone: 1 },
        { id: "c", label: "Caller", sub: "hears B", tone: 3 },
      ], [{ from: "b", to: "p", label: "selected" }, { from: "p", to: "c", label: "runs" }]),
      sections: [
        ["Assignment is a field", [
          "The inbound setup's last move is selecting the script on the point of contact. Studio Fundamentals says scripts assigned to POCs must define the flow from the start of the interaction on that channel.",
          "Editing a different script, or saving a new version under a new name and forgetting the POC, leaves production on the old flow. The platform is doing what the POC says.",
        ], ["inbound", "studioFund"]],
        ["Inside the script you may still branch", [
          "The one script can contain many Reqagent actions. The tutorial tells you to pick, on each branch, an inbound phone skill that matches that menu destination, and to assign that skill to the agents who should answer.",
          "That is how one POC script becomes sales, support, and billing without three points of contact.",
        ], ["basicScript"]],
      ],
      flow: flow("Promote a script by selecting it", ["Studio", "POC", "Caller", "Skill"], [
        step("Studio", "Studio", "Save the script", "Saving does not attach it.", { state: "saved" }),
        step("Studio", "POC", "Select it", "One script field.", { state: "assigned" }),
        step("Caller", "POC", "Call", "The assigned script runs.", { hears: "the selected flow" }),
        step("POC", "Skill", "Branch", "Reqagent names the destination skill.", { example: "Support" }),
      ]),
      quiz: [
        ["What makes a script the production flow for a number?", ["Selecting it on that number's point of contact", "Saving it in Studio", "Naming it Production", "Setting acceleration to 1"], 0, "The POC holds the script assignment.", "inbound"],
        ["How many scripts can that field hold?", ["One", "One per menu branch", "Ten", "Zero"], 0, "One script per POC. Branching happens inside it.", "poc"],
        ["The tutorial says each menu branch's skill must…", ["Match the destination and be assigned to the agents who handle it", "Be the tenant name", "Be a digital routing queue", "Stay blank"], 0, "Develop a Basic Script says the Support branch must use a skill assigned to support agents.", "basicScript"],
        ["A script that is saved but not selected…", ["Does not run for that number", "Runs for every number", "Runs only after hours", "Becomes the default for the business unit"], 0, "The POC is the assignment.", "studioFund"],
        ["Can one script request several skills?", ["Yes, with multiple Reqagent actions", "No", "Only if you create several POCs", "Only in WFM"], 0, "That is the menu pattern.", "basicScript"],
        ["POCs must use a script that defines the flow from where?", ["The start of the interaction on that channel", "The moment an agent answers", "The forecast", "Logout"], 0, "Studio Fundamentals says so.", "studioFund"],
      ],
      cards: [
        ["Assigned script", "The one named on the POC. The one that runs."],
        ["Saved script", "A file in Studio. Not automatically live."],
        ["Branch skill", "Reqagent on that menu arm."],
        ["One field", "You replace the POC script. You do not append a second one."],
      ],
      lab: ["Promote in the builder", "Use the Studio builder's Classics sample, then say where the POC field is.", [
        "Open the Studio builder and load the Classics sample.",
        "Export the lab JSON and read the script name you would type on a POC.",
        "Write a POC row that selects that script and a default skill.",
        "Change one Reqagent skill and note that the POC row did not need a second script.",
      ], "You can point at the POC field as the promote button."],
      faults: [
        ["Edited the copy", "Callers still hear the old menu after a long scripting session.", "script Main_v7 saved=yes\nPOC script=Main_v3", "The new name was never selected on the point of contact.", "Select Main_v7 on the POC, or save over the name the POC already uses, according to your change process.", "inbound"],
      ],
    }),
    quick({
      id: "campaign-home",
      title: "Campaigns hold skills",
      level: "foundation", minutes: 8,
      summary: "The skill form requires a campaign. Reporting and later staffing talk about skills. The campaign is the folder you chose at create time.",
      objectives: ["Select a campaign when creating a skill", "Not confuse campaign with tenant", "Not confuse campaign with POC"],
      figure: row("Campaign as the skill's folder", [
        { id: "t", label: "Tenant", sub: "global", tone: 1 },
        { id: "c", label: "Campaign", sub: "folder", tone: 2 },
        { id: "k", label: "Skills", sub: "many", tone: 4 },
        { id: "p", label: "POCs", sub: "point at skills", tone: 3 },
      ], [{ from: "t", to: "c", label: "owns" }, { from: "c", to: "k", label: "groups" }, { from: "p", to: "k", label: "uses" }]),
      sections: [
        ["The field", [
          "Set Up Inbound Voice tells you to select the campaign the skill should be part of. It does not, in that procedure, ask you to create the campaign. If you have no campaign, that is a separate setup question for your tenant's ACD configuration, not a step this page spells out.",
          "Putting a skill in the wrong campaign does not change the POC rule. The point of contact still points at the skill by name. Reports and WFM that filter by campaign can still look wrong.",
        ], ["inbound"]],
        ["WFM sees skills", [
          "The UCCE connector page says historical skill-based data is what Forecasting and Staffing use. Inside CXone, the forecast page also works from skills and historical ACD data.",
          "A campaign is not a WFM scheduling unit unless your WFM configuration says so. This lab does not invent that mapping.",
        ], ["ucce", "forecast"]],
      ],
      flow: flow("Place the skill, then point the POC at it", ["Campaign", "Skill", "POC", "WFM"], [
        step("Campaign", "Skill", "Select on create", "Required by the inbound skill form.", { field: "Campaign" }),
        step("Skill", "POC", "POC stores the skill", "The campaign is not re-selected on the POC.", { field: "ACD Skill" }),
        step("Skill", "WFM", "History by skill", "Forecasting uses skill history.", { not: "a guessed campaign map" }),
        step("Campaign", "Campaign", "Wrong folder", "Fix the skill's campaign if reports are sliced that way. Re-check the page for edit steps.", { effect: "reporting" }),
      ]),
      quiz: [
        ["The inbound skill form requires which container?", ["A campaign", "A SIP trunk", "An access key", "A Credly badge"], 0, "Select the campaign the skill should be part of.", "inbound"],
        ["Does the POC form, in the steps we cited, ask for the campaign again?", ["No. It asks for DNIS, skill, and script.", "Yes, three times", "Only for digital", "Only when IVR reporting is on"], 0, "The create steps name those fields.", "inbound"],
        ["UCCE historical data used by WFM forecasting is described as…", ["Skill-based", "Codec-based", "OAuth-based", "Menu-variable-based"], 0, "The connector page says historical skill-based data feeds Forecasting and Staffing.", "ucce"],
        ["This lab's mapping from campaign to WFM scheduling unit is…", ["Not invented. Confirm in your WFM configuration.", "Always one-to-one", "Always ignored", "Defined by RFC 3261"], 0, "Do not add a mapping the pages do not state.", "forecast"],
        ["Tenant and campaign are the same object.", ["False", "True", "True in FedRAMP only", "True for digital"], 0, "The tenant is the top grouping. The campaign is what the skill form selects.", "admin"],
        ["A skill with no campaign…", ["Cannot complete the create form described on the page", "Is the recommended pattern", "Is a digital routing queue", "Is an access key"], 0, "The form tells you to select one.", "inbound"],
      ],
      cards: [
        ["Campaign", "Chosen when the skill is created."],
        ["Not the POC", "The POC points at the skill, not at the campaign field again."],
        ["Not the tenant", "Tenant is support, billing, and global settings."],
        ["Skill history", "What WFM forecasting consumes, including from the UCCE connector."],
      ],
      lab: ["Label three boxes", "Tenant, campaign, skill.", [
        "Put global billing on the tenant.",
        "Put three skill names inside one campaign.",
        "Draw POCs pointing at skills, skipping the campaign box.",
        "Write 'WFM reads skills' under the skill box.",
      ], "The arrows match the forms."],
      faults: [
        ["Reports look empty", "A new skill takes calls but the campaign report the managers use does not show them.", "skill=Sales_IB campaign=Sandbox\nmanagers filter campaign=Production", "The create form's campaign was the wrong folder. Calls still route, because the POC points at the skill.", "Move or recreate the skill in the campaign the report uses, after you confirm the edit path on the current help page.", "inbound"],
      ],
    }),
    quick({
      id: "permissions-path",
      title: "Permissions along the setup path",
      level: "foundation", minutes: 9,
      summary: "The inbound page names skill and POC permissions, and script create permission. A person who can build a script may still be unable to attach it.",
      objectives: ["Quote the three permissions the page names", "Expect a missing button to be a role", "Keep API keys out of this path"],
      figure: row("Three permissions", [
        { id: "k", label: "Skills", sub: "Create, Edit", tone: 4 },
        { id: "s", label: "Scripts", sub: "Create", tone: 3 },
        { id: "p", label: "POCs", sub: "Create", tone: 1 },
        { id: "r", label: "Role", sub: "holds them", tone: 2 },
      ], [{ from: "r", to: "k", label: "" }, { from: "r", to: "s", label: "" }, { from: "r", to: "p", label: "" }]),
      sections: [
        ["The three lines", [
          "Skill work: ACD > Skills Create, Edit. Script work, on the setup page: ACD > Contact Settings > Scripts Create. POC work: ACD > Contact Settings > Points of Contact Create.",
          "Those strings are easy to shorten in a ticket until someone cannot click Create. Paste the full string into the access request.",
        ], ["inbound"]],
        ["Roles, again", [
          "The Admin page is where the role gains those permissions. An implementer with Studio open and no POC permission will finish the script and stop.",
          "This path does not use an access key. Keys are for applications. A human implementer uses a role and a login authenticator.",
        ], ["admin", "gettingStarted"]],
      ],
      flow: flow("Ask for the three rights", ["Implementer", "Role", "ACD", "Done"], [
        step("Implementer", "Role", "Request", "Paste the three permission strings.", { from: "Set Up Inbound Voice" }),
        step("Role", "ACD", "Skills", "Create and edit.", { ok: "skill exists" }),
        step("Role", "ACD", "Scripts", "Create.", { ok: "BEGIN to REQAGENT" }),
        step("Role", "ACD", "POCs", "Create and select the DNIS.", { ok: "number is live" }),
      ]),
      quiz: [
        ["Skill permission on the inbound page?", ["ACD > Skills Create, Edit", "ACD > Skills View", "Admin > Employees Create only", "None"], 0, "Create and edit, not view alone.", "inbound"],
        ["Script permission on that page?", ["ACD > Contact Settings > Scripts Create", "Studio is ungated", "WFM > Forecast", "OAuth admin"], 0, "The page prints it above the script steps.", "inbound"],
        ["POC permission?", ["ACD > Contact Settings > Points of Contact Create", "Points of Contact View", "Digital Engagement only", "Access Key Create"], 0, "Create, specifically.", "inbound"],
        ["A missing Create button is first a question about…", ["The role", "The SIP codec", "Proficiency 20", "The weather"], 0, "Permissions are on the role.", "admin"],
        ["Should the implementer's daily login be an access key?", ["No. A person uses a login authenticator. A key is for an application.", "Yes", "Only on Fridays", "Only for POCs"], 0, "Getting Started separates the two.", "gettingStarted"],
        ["View permission is enough to create a skill.", ["False", "True", "True if you also have a DNIS", "True in the script"], 0, "The page says Create, Edit.", "inbound"],
      ],
      cards: [
        ["Skills Create, Edit", "The skill permission string."],
        ["Scripts Create", "The script permission string on the setup page."],
        ["Points of Contact Create", "The POC permission string."],
        ["Role", "Where those strings have to be turned on."],
      ],
      lab: ["Write the access request", "Three bullets, full strings.", [
        "Copy the three permission names from this lesson.",
        "Add the business reason: one inbound number.",
        "Add 'login authenticator already assigned' so nobody converts the user into an API account.",
        "Leave SKUs out.",
      ], "The request can be approved without a follow-up question about which button."],
      faults: [
        ["Script done, POC greyed out", "The number never goes live on the day.", "user=implementer skills=yes scripts=yes\nPOC create=hidden", "The role has two of the three permissions.", "Add Points of Contact Create. Do not share an administrator session as a workaround.", "inbound"],
      ],
    }),
  ]),
];
