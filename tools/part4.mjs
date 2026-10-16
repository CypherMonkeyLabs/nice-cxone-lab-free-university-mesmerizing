import { quick, row, rings, flow, step } from "./shape.mjs";
function track(id, title, blurb, accent, lessons) { return { id, title, blurb, accent, lessons }; }

export const part4 = [
  track("people", "People, teams, and agent apps", "Employees, proficiency, digital attributes, and the agent applications the help pages still name.", 4, [
    quick({
      id: "employee-profile",
      title: "Employee profiles",
      level: "foundation", minutes: 10,
      summary: "An employee has a first name, last name, an email-shaped username, and a primary role. Special characters the getting-started page lists are rejected in names.",
      objectives: ["Create an employee with the required fields", "Avoid the banned characters", "Choose Create versus Create & Invite"],
      figure: row("The employee form", [
        { id: "n", label: "Name", sub: "no ! / < >", tone: 1 },
        { id: "u", label: "Username", sub: "email form", tone: 2 },
        { id: "r", label: "Role", sub: "primary", tone: 4 },
        { id: "a", label: "Authenticator", sub: "people only", tone: 3 },
      ], [{ from: "n", to: "u", label: "" }, { from: "u", to: "r", label: "" }, { from: "r", to: "a", label: "if human" }]),
      sections: [
        ["The Getting Started steps", [
          "Admin, Employees, Create Employee. First and last name are required. Middle name is optional. The page says special characters are not accepted in those fields, including ! / < > ? % and the double quote.",
          "The username must be in the form of an email address and is filled from the email field. You can edit it. Assign a primary role. Create saves the profile. Create & Invite sends the activation mail.",
        ], ["gettingStarted"]],
        ["Humans and applications diverge here", [
          "A person who will log in needs a login authenticator, selected on the Security tab when you are setting up OpenID Connect. A back-end application employee must not have one.",
          "The Access Keys tab appears after the account exists. The Avaya page says to activate the account, then generate the key.",
        ], ["gettingStarted", "avaya"]],
      ],
      flow: flow("Create and invite a person", ["Admin", "Form", "Mail", "Security"], [
        step("Admin", "Form", "Names and role", "Reject the listed special characters.", { button: "Create & Invite" }),
        step("Form", "Mail", "Activation", "The user sets a password from the mail.", { needed: "login authenticator" }),
        step("Mail", "Security", "Authenticator", "Without it, the page says the employee cannot log in.", { human: "yes" }),
        step("Security", "Security", "No key yet", "Keys are a later, separate step for applications.", { not: "the password" }),
      ]),
      quiz: [
        ["Which characters does Getting Started say are rejected in names?", ["Including ! / < > ? % and double quote", "Spaces only", "Digits only", "None"], 0, "The page gives that list and says it is not exhaustive.", "gettingStarted"],
        ["Username format?", ["An email address", "A short code", "A skill name", "A DNIS"], 0, "It is auto-filled from the email address and can be edited.", "gettingStarted"],
        ["Create & Invite does what extra?", ["Sends activation so the user can set a password", "Creates an access key", "Creates a skill", "Opens Studio"], 0, "Create alone saves the profile for more editing.", "gettingStarted"],
        ["Who must have a login authenticator?", ["Employees who log in", "Back-end API accounts", "Points of contact", "Campaigns"], 0, "The page says employees can only log in if they have one, and API accounts should not.", "gettingStarted"],
        ["When does the Access Keys tab show up, on the Avaya page?", ["After the account is created and activated", "Before the employee exists", "On the skill", "Never"], 0, "The page says the tab appears after account creation, and activation matters.", "avaya"],
        ["Middle name is…", ["Optional", "Required", "The access key id", "The tenant id"], 0, "First and last are required.", "gettingStarted"],
      ],
      cards: [
        ["Email-shaped username", "Required form, even if you edit it."],
        ["Create & Invite", "Sends the activation email."],
        ["Login authenticator", "Required for humans. Forbidden for back-end apps."],
        ["Banned characters", "The page lists ! / < > ? % and the double quote in names."],
      ],
      lab: ["Fill two profiles", "One human, one connector.", [
        "Human: real-looking synthetic name, email username, primary role, authenticator, Create & Invite.",
        "Connector: name with no banned characters, role with two permissions, no authenticator.",
        "Write 'activate, then key' only under the connector.",
        "Do not put a password in the connector row.",
      ], "The two rows cannot be swapped."],
      faults: [
        ["Name rejected", "Create fails on a last name pasted from a directory export.", "lastName=O'Neil/Temp\nerror=special characters", "The slash and similar characters are in the rejected set. The page says the list is not complete, so other characters can fail too.", "Retype the name without the characters the page lists, and simplify anything else the form rejects.", "gettingStarted"],
      ],
    }),
    quick({
      id: "proficiency-assign",
      title: "Assign a skill and a proficiency",
      level: "foundation", minutes: 11,
      summary: "Assignment is not complete at the skill name. Bullseye needs a proficiency from 1 to 20, and 1 is best. The Classics example starts at 1–5 and widens to 1–8.",
      objectives: ["Set proficiency with 1 as best", "Read the Classics window", "Use the routing simulator to watch it"],
      figure: rings("Classics, Inc. fiction skill, from the bullseye page", [
        { label: "1–5", note: "opening REQAGENT" },
        { label: "1–8", note: "after 90s Music" },
      ], [{ name: "Amina", prof: 2 }, { name: "Luis", prof: 7 }]),
      sections: [
        ["The Classics story", [
          "On the bullseye page, Marguerite sets the fiction skill's REQAGENT to HighProficiency 1 and LowProficiency 5. Music plays for 90 seconds. UpdateContact then sets HighProficiency 1 and LowProficiency 8. Agents scored 6, 7, or 8 become eligible only after the wait.",
          "She assigned proficiency from fluency, and she checked it before editing the script. Proficiency can be set on the ACD user profile or the skill record.",
        ], ["bullseye"]],
        ["Digital uses the same 1–20 scale", [
          "UPDATE CONTACT DIGITAL says the highest proficiency an agent must have, and the lowest, are whole numbers from 1 to 20, 1 best and 20 worst. Digital priority on that action does not accelerate. The page says to use workflow automation if you need to change digital priority.",
          "The simulator in this lab uses the same window. Its longest-idle tie-break is labeled as a classroom rule.",
        ], ["updateDigital"]],
      ],
      flow: flow("Widen the pool", ["Contact", "REQAGENT", "Music", "UpdateContact", "Agent"], [
        step("Contact", "REQAGENT", "Window 1–5", "Only the strongest proficiencies.", { high: "1", low: "5" }),
        step("REQAGENT", "Music", "90 seconds", "The page's wait before widening.", { seconds: "90" }),
        step("Music", "UpdateContact", "Window 1–8", "The pool grows.", { high: "1", low: "8" }),
        step("UpdateContact", "Agent", "Deliver", "An agent at proficiency 7 can now match.", { scale: "1 best" }),
      ]),
      quiz: [
        ["Classics opening window?", ["High 1, low 5", "High 20, low 1", "High 8, low 1", "No window"], 0, "That is the fiction skill example.", "bullseye"],
        ["What happens at 90 seconds in that example?", ["UpdateContact sets low proficiency to 8", "The call hangs up", "Acceleration becomes 0", "The POC changes"], 0, "Music, then UpdateContact.", "bullseye"],
        ["Proficiency 20 means…", ["Worst", "Best", "Offline", "Supervisor"], 0, "Both the bullseye page and the digital update page say 1 is best and 20 is worst.", "updateDigital"],
        ["Where can you assign proficiency?", ["ACD user profile or skill record", "Only in the OAuth token", "Only in WFM bids", "Only on the DNIS"], 0, "The bullseye key facts say either.", "bullseye"],
        ["Digital Update Contact acceleration?", ["The page says digital priority has no acceleration", "It uses the voice formula", "It is always 5", "It is proficiency"], 0, "Change digital priority with workflow automation if you need to.", "updateDigital"],
        ["An agent at proficiency 7 during the first 90 seconds of the Classics script is…", ["Outside the 1–5 window", "The first choice", "On the POC", "A routing attribute"], 0, "They join after the window widens to 8.", "bullseye"],
      ],
      cards: [
        ["1 best, 20 worst", "The scale. Do not invert it."],
        ["HighProficiency", "The best end of the window. Usually the smaller number."],
        ["90 seconds", "The Music wait in the Classics example."],
        ["UpdateContact", "The action that widens the window."],
      ],
      lab: ["Run the Classics window", "Use the routing simulator.", [
        "Set high 1, low 5, widen-after 90, widened low 8.",
        "Give one agent proficiency 2 and another 7.",
        "Step until 90 seconds and confirm the proficiency 7 agent is out, then in.",
        "Read the trace. Remember longest-idle is this lab's tie-break.",
      ], "The trace matches the help page's story."],
      faults: [
        ["Window never widens", "Wait time passes 90 seconds and only proficiency 1–5 are offered.", "REQAGENT high=1 low=5\nMusic=90\nUpdateContact=missing", "The second action from the example was never added.", "Add UpdateContact with low 8, or whatever window operations agreed, after the Music wait.", "bullseye"],
      ],
    }),
    quick({
      id: "agent-apps",
      title: "MAX and Agent Workspace",
      level: "foundation", minutes: 10,
      summary: "Current help still names MAX and a family of Agent Workspace applications. Digital support is not identical across them. AutoSummary lists the ones it works with.",
      objectives: ["Use the current application names", "Check digital support per app", "Include MAX when the page includes MAX"],
      figure: row("Agent applications named in help", [
        { id: "m", label: "MAX", sub: "digital: all, per page", tone: 2 },
        { id: "a", label: "Workspace", sub: "Agent", tone: 1 },
        { id: "e", label: "Embedded", sub: "and Teams, browser", tone: 3 },
        { id: "s", label: "Salesforce", sub: "Lightning console", tone: 4 },
      ], [{ from: "m", to: "a", label: "both current" }, { from: "a", to: "e", label: "family" }, { from: "a", to: "s", label: "CRM" }]),
      sections: [
        ["Digital channels page", [
          "Agents use MAX or the Agent Workspace suite. The page says MAX supports all available digital channels. Support inside the Agent Workspace suite depends on the application, and you should read that application's details.",
          "They also need channel permissions, the Digital Engagement attribute, and the skill or queue.",
        ], ["digitalChannels"]],
        ["AutoSummary's list", [
          "The AutoSummary overview says it works with Agent Workspace (Agent), the browser extension (Agent Integrated), embedded (Agent Embedded), Microsoft Teams, Salesforce Agent, and MAX.",
          "Using it on MAX requires a Copilot for Agents license as well as AutoSummary enablement. The 26.2 rename table is a separate, moving list. Do not delete MAX from a design because a rename row exists for a different product.",
        ], ["autosummary", "autosummarySetup"]],
      ],
      flow: flow("Pick an app, then check the channel", ["Agent", "App", "Help page", "Channel"], [
        step("Agent", "App", "Name the application", "MAX or a specific Workspace app.", { vague: "not just 'the agent app'" }),
        step("App", "Help page", "Read its channel list", "Workspace support is per application.", { max: "page says all digital" }),
        step("Help page", "Channel", "Attribute and skill", "Digital Engagement plus the skill.", { both: "required" }),
        step("Channel", "Channel", "AutoSummary?", "Check the overview list before you promise summaries.", { max: "needs Copilot license" }),
      ]),
      quiz: [
        ["MAX and digital channels, per the digital page?", ["MAX supports all available digital channels", "MAX supports none", "MAX is removed", "MAX is WFM"], 0, "The page says so, and tells you to check Workspace apps individually.", "digitalChannels"],
        ["AutoSummary on MAX needs…", ["A Copilot for Agents license, and AutoSummary enabled", "Only a phone skill", "An Avaya key", "No license"], 0, "The setup page separates MAX from the agent applications.", "autosummarySetup"],
        ["Name one Workspace variant the AutoSummary overview lists.", ["Embedded, Teams, browser extension, or Agent", "Personal Connection", "Forecasting", "ScreenAgent only"], 0, "The overview lists those plus Salesforce Agent and MAX.", "autosummary"],
        ["Is 'the agent app' specific enough in a design?", ["No. Name MAX or the Workspace variant.", "Yes", "Only for voice", "Only after 26.4"], 0, "Digital support differs inside the suite.", "digitalChannels"],
        ["Salesforce Agent is on the AutoSummary list.", ["True", "False", "Only for SMS", "Only with routing queues"], 0, "The overview names it.", "autosummary"],
        ["26.2 rename rows mean MAX is gone.", ["Not from the pages used here. MAX is still named.", "Yes", "MAX was never real", "MAX is RFC 3261"], 0, "Keep both names until the feature page drops one.", "autosummary"],
      ],
      cards: [
        ["MAX", "Still documented. Digital page: all available digital channels."],
        ["Agent Workspace", "A suite. Check the specific app."],
        ["AutoSummary list", "Workspace variants, Salesforce Agent, and MAX."],
        ["Copilot license", "Extra gate for AutoSummary on MAX."],
      ],
      lab: ["Name the app in a test plan", "Replace 'agent UI' with a real name.", [
        "Write the channel: inbound chat.",
        "Pick MAX and cite the digital channels sentence.",
        "Write a second plan for one Workspace app and mark 'confirm channel support on that app's page'.",
        "Add the attribute and the skill to both plans.",
      ], "Neither plan says 'the agent app'."],
      faults: [
        ["Workspace app without chat", "Agents moved from MAX to a Workspace application and chat stopped.", "from=MAX to=Agent Workspace variant\nchat offer=none\nattribute=on skill=on", "The digital page says Workspace channel support depends on the application. MAX's 'all channels' sentence does not transfer automatically.", "Open that application's help and confirm chat, or move chat agents back to a supported app.", "digitalChannels"],
      ],
    }),
    quick({
      id: "data-access",
      title: "Who can see a recording",
      level: "intermediate", minutes: 9,
      summary: "Seeing a recording is a permission question. The Admin page says agents may see only their own interactions while supervisors see more. Recording Management is a separate product surface.",
      objectives: ["Treat visibility as a permission", "Not confuse record with view", "Know hold audio is absent even for people who can play the file"],
      figure: row("Record, store, permit", [
        { id: "r", label: "Record", sub: "policy", tone: 4 },
        { id: "s", label: "Store", sub: "cloud storage", tone: 2 },
        { id: "p", label: "Permission", sub: "who can play", tone: 1 },
        { id: "h", label: "Hold gap", sub: "not a bug", tone: 3 },
      ], [{ from: "r", to: "s", label: "" }, { from: "s", to: "p", label: "" }, { from: "r", to: "h", label: "hold skipped" }]),
      sections: [
        ["Permissions", [
          "The Admin page says access to recordings and interactions is typically permission-based. Agents may view only their own. Supervisors or administrators may see a team or more. You review those permissions for operations and for compliance.",
          "A user who cannot find a recording may be outside their view, not looking at a failed recorder.",
        ], ["admin"]],
        ["The file itself", [
          "Recording Management says calls on hold are not recorded. The recording stops on hold, including hold music, and resumes when the agent returns. A consultation during hold is recorded.",
          "Stereo is the default, and mono is supported. Stereo lets you use analytics, keep participants separate, and play one side. The page tells you to ask your account representative if you have questions.",
        ], ["recording"]],
      ],
      flow: flow("An agent cannot find a call", ["Agent", "Permission", "Search", "File"], [
        step("Agent", "Permission", "Check the role", "Own interactions only is a normal setting.", { not: "a recorder outage" }),
        step("Permission", "Search", "Supervisor search", "A broader role should see the team.", { if_missing: "then check recording" }),
        step("Search", "File", "Play", "Hold time is a gap.", { expected: "yes" }),
        step("File", "File", "One side", "Stereo can play one participant.", { default: "stereo" }),
      ]),
      quiz: [
        ["Agent visibility, in the Admin page's example?", ["They may see only their own interactions", "They always see the tenant", "They see every recording", "They see WFM only"], 0, "Supervisors may see more. It is a permission.", "admin"],
        ["Hold audio in the recording?", ["Not captured. Recording resumes when the agent returns.", "Always captured, including music", "Captured only in mono", "Captured only for digital"], 0, "Recording Management is explicit.", "recording"],
        ["Default channel layout?", ["Stereo, with mono supported", "Mono only", "No audio", "Video only"], 0, "Stereo is the default. Ask the account representative if you need a decision.", "recording"],
        ["A consultation while the caller is on hold…", ["Is recorded", "Is never recorded", "Deletes the file", "Changes proficiency"], 0, "The page distinguishes hold audio from consultation audio.", "recording"],
        ["A missing recording in the agent app is first…", ["A permission or view check", "A carrier ticket", "A bullseye bug", "An OAuth bug"], 0, "The Admin page makes visibility a permission.", "admin"],
        ["Playing one side of a call depends on…", ["Stereo recording", "Acceleration", "The campaign name", "Public Preview only"], 0, "The page lists that as a reason to use stereo.", "recording"],
      ],
      cards: [
        ["Own interactions", "A normal agent permission, not an outage."],
        ["Hold gap", "Expected. Music on hold is not in the file."],
        ["Consultation", "Recorded even during the caller's hold."],
        ["Stereo default", "Separate participants. Mono is available."],
      ],
      lab: ["Classify three gaps", "Permission, hold, or failure.", [
        "Agent cannot see a teammate's call. Mark permission.",
        "A file has silence where hold music played. Mark expected.",
        "A supervisor with team access finds no file and no hold. Mark investigate recording, not the agent role.",
        "Write the stereo sentence under the file that must support analytics.",
      ], "The three gaps have three different owners."],
      faults: [
        ["Silence ticket for hold", "Quality opens a severity-1 because every recording 'drops' when agents hold.", "pattern=gap only during hold\nresume=on retrieve\nconsultation=present", "That is the documented hold behavior.", "Close the ticket as expected behavior and show the Recording Management paragraph. Investigate gaps that happen during talk time.", "recording"],
      ],
    }),
    quick({
      id: "teams-views",
      title: "Teams, views, and what we will not invent",
      level: "foundation", minutes: 8,
      summary: "Supervisors are described as having broader visibility. The Admin page also names views as a security tool. This lesson does not invent a team-hierarchy feature the page does not describe.",
      objectives: ["Use the word view as the page does", "Separate team visibility from a guessed org chart", "Ask for the current view help before a design"],
      figure: row("Role and view", [
        { id: "r", label: "Role", sub: "what you can do", tone: 1 },
        { id: "v", label: "View", sub: "named on the page", tone: 3 },
        { id: "a", label: "Agent", sub: "own data", tone: 4 },
        { id: "s", label: "Supervisor", sub: "broader", tone: 2 },
      ], [{ from: "r", to: "a", label: "narrow" }, { from: "r", to: "s", label: "broad" }, { from: "v", to: "s", label: "data access" }]),
      sections: [
        ["What is written", [
          "The Admin page lists views next to roles, login authenticators, and access keys as the way you manage security and data access. It says agents may see their own interactions and supervisors may have broader visibility across teams or business units.",
          "It does not, in that passage, define how a team record is created or how a view is filtered. Those steps need the current view and team help pages. This lab will not invent the click path.",
        ], ["admin"]],
        ["Why the distinction matters", [
          "A bullseye pool is about proficiency and attributes, not about the supervisor's team. A WFM schedule is about staffing. A view is about who can see data. Three different 'groups' get confused in design reviews.",
          "When you say team, say which product's team you mean.",
        ], ["bullseye", "wfm"]],
      ],
      flow: flow("Three meanings of group", ["Speaker", "Skill", "View", "Schedule"], [
        step("Speaker", "Skill", "Bullseye pool", "Proficiency and routing attributes.", { not: "the supervisor team" }),
        step("Speaker", "View", "Who can see", "Roles and views.", { example: "own interactions" }),
        step("Speaker", "Schedule", "Who is staffed", "WFM.", { product: "CXone WFM or IEX" }),
        step("Speaker", "Speaker", "Say which", "The word team alone is ambiguous.", { action: "name the product" }),
      ]),
      quiz: [
        ["Views are listed beside what, on the Admin page?", ["Roles, login authenticators, and access keys", "SIP trunks and codecs", "Menu variables", "Forecast models"], 0, "That is the security toolset the page names.", "admin"],
        ["Does this lesson include a click-path for creating a team?", ["No. That path was not in the cited passage.", "Yes. Teams are created under Studio.", "Yes. Teams are access keys.", "Yes. Teams are DNIS records."], 0, "Look up the current page rather than memorizing a path from this lab.", "admin"],
        ["A bullseye pool is…", ["Agents inside a proficiency or attribute window", "The supervisor's view", "A WFM bid", "An OAuth scope"], 0, "Do not implement bullseye by editing a view.", "bullseye"],
        ["Broader supervisor visibility is described as…", ["Across teams or business units", "Always the whole world, with no permission", "Impossible", "Limited to their own calls only, always"], 0, "The page says 'may', and it is a permission design.", "admin"],
        ["IEX and CXone WFM…", ["Are different products", "Are the same button", "Are CRM systems", "Are SIP trunks"], 0, "The WFM welcome page separates them.", "wfm"],
        ["Saying 'team' in a design review without a product…", ["Is ambiguous", "Is always the ACD team", "Is always WFM", "Is always a view"], 0, "Name the product.", "admin"],
      ],
      cards: [
        ["View", "A security object the Admin page names. Steps not invented here."],
        ["Own interactions", "The agent example."],
        ["Broader visibility", "The supervisor example. Still a permission."],
        ["Three groups", "Bullseye pool, data view, WFM schedule."],
      ],
      lab: ["Rewrite three sentences", "Each 'team' becomes a specific object.", [
        "Change 'the Spanish team gets the call' to 'agents inside the Spanish proficiency window'.",
        "Change 'the Spanish team can hear recordings' to 'a role and view'.",
        "Change 'the Spanish team is off at noon' to 'the WFM schedule'.",
        "Leave a footnote for the team click-path: open current help.",
      ], "The three sentences no longer share a fake object."],
      faults: [
        ["View edited to fix bullseye", "A supervisor's view is widened and the queue wait does not change.", "change=view includes all teams\nwait=still high\nscript window=1–3", "Visibility is not delivery. The script window is.", "Edit UpdateContact or the agent proficiencies. Leave the view change only if it was a separate access bug.", "bullseye"],
      ],
    }),
    quick({
      id: "digital-agent-ready",
      title: "Make one agent digitally ready",
      level: "foundation", minutes: 9,
      summary: "Four checks: supported app, channel permission, Digital Engagement, and the digital skill. Missing any one of them looks like a routing bug.",
      objectives: ["Run the four checks", "Prefer skills over new queues", "Test with one contact"],
      figure: row("Four gates", [
        { id: "a", label: "App", sub: "MAX or checked Workspace", tone: 1 },
        { id: "p", label: "Permission", sub: "that channel", tone: 2 },
        { id: "d", label: "Attribute", sub: "Digital Engagement", tone: 3 },
        { id: "s", label: "Skill", sub: "digital", tone: 4 },
      ], [{ from: "a", to: "p", label: "" }, { from: "p", to: "d", label: "" }, { from: "d", to: "s", label: "" }]),
      sections: [
        ["The list", [
          "Digital Channels lists the agent requirements together: a supported application, permissions for each channel, the Digital Engagement attribute, and assignment to the routing queues or digital skills that handle the channel.",
          "New inbound configuration should be the skill, not a new routing queue. The agent line still mentions queues because old queues remain and stay synced with skills.",
        ], ["digitalChannels", "digitalSkills"]],
        ["One contact proves it", [
          "After the four checks, send one inbound contact on that channel. If it queues on the default digital skill and the agent is available inside any bullseye window, the agent should be offerable.",
          "If the script retargets to a second digital skill, the agent needs that skill too. The default skill on the POC is only the start.",
        ], ["digitalRouting"]],
      ],
      flow: flow("Four checks then one message", ["Admin", "Role", "Employee", "ACD"], [
        step("Admin", "Employee", "Attribute", "Digital Engagement on.", { check: "1" }),
        step("Role", "Role", "Channel permission", "The specific channel.", { check: "2" }),
        step("Employee", "ACD", "Digital skill", "The one the script requests.", { check: "3" }),
        step("ACD", "ACD", "App", "MAX, or a Workspace app you verified.", { check: "4" }),
      ]),
      quiz: [
        ["How many of the four checks are optional?", ["None. The page lists them as requirements.", "Three", "The attribute", "The skill"], 0, "App, permission, attribute, and skill or queue.", "digitalChannels"],
        ["New inbound digital work should add…", ["A digital skill", "A new routing queue", "A phone POC", "A SIP trunk"], 0, "You cannot create new routing queues. Old ones remain.", "digitalSkills"],
        ["The POC default skill is…", ["The starting skill. The script may change it.", "The only skill that will ever be used", "A WFM schedule", "An access key"], 0, "Digital routing describes that pattern.", "digitalRouting"],
        ["MAX, for digital, according to the page?", ["Supports all available digital channels", "Supports none", "Is unsupported", "Is a CRM"], 0, "Workspace apps need their own check.", "digitalChannels"],
        ["An agent on the default skill who misses the script's retarget skill…", ["Will not be offered that contact", "Will still be offered it", "Becomes a supervisor", "Breaks OAuth"], 0, "Delivery follows the skill the script requests.", "digitalRouting"],
        ["Old routing queues…", ["Stay synced with digital skills", "Were deleted in 2020 with no remainder", "Are phone skills", "Are access keys"], 0, "The page says the lists stay consistent.", "digitalRouting"],
      ],
      cards: [
        ["Four checks", "App, permission, Digital Engagement, skill."],
        ["Default skill", "Start, not necessarily the final skill."],
        ["No new queues", "For new inbound digital work."],
        ["Sync", "Old queues and digital skills stay aligned."],
      ],
      lab: ["Checklist a synthetic agent", "All four, then a retarget.", [
        "Create a paper profile: MAX, chat permission, attribute on, skill Chat_Main.",
        "Write a script note: Reqagent Chat_Returns for one branch.",
        "Add Chat_Returns to the profile.",
        "Mark the test: one chat that takes each branch.",
      ], "Both skills are on the profile before the test."],
      faults: [
        ["Available and skipped", "The agent is green on Chat_Main while returns chats wait.", "agent skills=Chat_Main\nscript branch=Chat_Returns\nattribute=on", "The script retargeted. The agent was never assigned the second skill.", "Assign Chat_Returns or change the branch. Do not open a carrier ticket.", "digitalRouting"],
      ],
    }),
    quick({
      id: "screen-and-voice",
      title: "ScreenAgent beside the voice recording",
      level: "intermediate", minutes: 9,
      summary: "ScreenAgent records the screen. From version 2.1.40 it can mask the screen when voice is masked, so a paused voice recording does not leave the sensitive screen in the file.",
      objectives: ["Separate screen and voice", "Cite the 2.1.40 masking behavior", "Not invent install steps"],
      figure: row("Two recorders", [
        { id: "v", label: "Voice", sub: "stereo default", tone: 1 },
        { id: "s", label: "ScreenAgent", sub: "screen", tone: 3 },
        { id: "m", label: "Mask", sub: "2.1.40+", tone: 2 },
        { id: "q", label: "QM", sub: "uses both", tone: 4 },
      ], [{ from: "v", to: "q", label: "" }, { from: "s", to: "q", label: "" }, { from: "m", to: "s", label: "when voice masks" }]),
      sections: [
        ["What the recording page says", [
          "Recording Management supports audio and screen for quality and compliance. ScreenAgent records and monitors screen activity. The page points at separate install topics for Windows and for Mac, which this lesson does not copy.",
          "During masking, screen recording can be masked for all participants when the voice interaction is masked, so sensitive data is not left on the digital recording. The page says this is available with ScreenAgent 2.1.40 and later.",
        ], ["recording"]],
        ["Not the same gap as hold", [
          "Hold stops voice recording. Masking hides content while recording policy says the content is sensitive. A reviewer should say which of the two they are looking at.",
          "Third-party telephony recording is a further path, through Engagement Hub, and it has its own supported-deployment table. It is not ScreenAgent.",
        ], ["recording", "engagement"]],
      ],
      flow: flow("Mask voice and screen together", ["Policy", "Voice", "ScreenAgent", "Reviewer"], [
        step("Policy", "Voice", "Mask the sensitive span", "Voice recording masks.", { trigger: "policy" }),
        step("Voice", "ScreenAgent", "2.1.40 or later", "Screen masks with the voice.", { older: "confirm behavior on the page" }),
        step("ScreenAgent", "Reviewer", "Play", "Sensitive digits should not remain on screen.", { version: "check" }),
        step("Reviewer", "Reviewer", "Hold is different", "Hold is a stop, not a mask.", { do_not_mix: "yes" }),
      ]),
      quiz: [
        ["ScreenAgent 2.1.40 adds what, in the page's words?", ["Screen masking when the voice interaction is masked", "Bullseye", "A new issuer URL", "Personal Connection pacing"], 0, "So sensitive data is not transferred via the screen recording.", "recording"],
        ["Install steps for ScreenAgent in this lesson are…", ["Not copied. The page points at Windows and Mac topics.", "Included as a guessed MSI", "The same as Softphone", "Unnecessary"], 0, "Open those topics for the procedure.", "recording"],
        ["Hold versus mask?", ["Hold stops recording. Mask hides sensitive content.", "They are the same", "Hold is stereo", "Mask deletes the employee"], 0, "Do not ticket one as the other.", "recording"],
        ["Engagement Hub recording is…", ["A path for third-party telephony, not ScreenAgent", "The screen recorder", "An OAuth grant", "A menu action"], 0, "The recording page points third-party telephony at Engagement Hub.", "engagement"],
        ["Stereo is…", ["The default voice recording layout", "A screen codec", "Required for masking", "A proficiency"], 0, "The page says stereo by default, mono supported.", "recording"],
        ["QM uses recordings for…", ["Quality processes and compliance, as the page frames it", "SIP registration", "Token refresh", "Campaign creation"], 0, "That is the opening sentence of Recording Management.", "recording"],
      ],
      cards: [
        ["ScreenAgent", "Screen recording and monitoring. Install topics are separate."],
        ["2.1.40", "Screen can mask when voice masks."],
        ["Hold", "Recording stops. Not a mask."],
        ["Engagement Hub", "Third-party telephony into CXone, including recording."],
      ],
      lab: ["Label a playback", "Talk, hold, masked digits, screen.", [
        "Mark talk as present.",
        "Mark hold as an expected audio gap.",
        "Mark a card number as masked on voice and, if ScreenAgent is 2.1.40 or newer, on screen.",
        "If the screen build is older, write 'confirm on the help page' instead of assuming the mask.",
      ], "The labels use only the documented behavior."],
      faults: [
        ["Digits on screen, tone in the ear", "Voice masking works and the screen recording still shows the card number.", "voiceMask=on screen=visible\nScreenAgent=2.1.12", "The combined mask is documented from 2.1.40.", "Upgrade ScreenAgent to 2.1.40 or later and retest. Do not call the voice mask a failure.", "recording"],
      ],
    }),
  ]),
  track("routing", "Skills and routing", "Priority math, bullseye, routing attributes, and the Personal Connection exception.", 1, [
    quick({
      id: "priority-math",
      title: "Priority and acceleration",
      level: "foundation", minutes: 12,
      summary: "Overall priority is (Time × Acceleration) + Initial Priority, capped by Maximum Priority. The published three-minute example lands on 7.",
      objectives: ["Compute the formula", "Explain the 30-second half step", "Cap at maximum"],
      figure: row("Aging in queue", [
        { id: "i", label: "Initial", sub: "4", tone: 2 },
        { id: "a", label: "Acceleration", sub: "1", tone: 1 },
        { id: "t", label: "Time", sub: "minutes", tone: 3 },
        { id: "p", label: "Priority", sub: "7 at 3 min", tone: 4 },
      ], [{ from: "i", to: "p", label: "+" }, { from: "a", to: "p", label: "× time" }]),
      sections: [
        ["The formula", [
          "The static delivery page says acceleration is how fast priority rises. The default is 1. The minimum is 0. Maximum priority caps the result. For every minute in queue, priority increases by the acceleration value. With acceleration 1, thirty seconds adds 0.5.",
          "Example: initial 4, acceleration 1, three minutes, priority 7. The formula line is Overall Priority = (Time × Acceleration) + Initial Priority.",
        ], ["priority"]],
        ["A sentence that does not match", [
          "The same page says a skill with initial 1 and acceleration 5 overtakes a skill with initial 3 and acceleration 1 after one minute, reaching 6. That part matches the formula: (1 × 5) + 1 = 6.",
          "It also says the second skill starts at priority 4. The formula at time zero is 3. This lab teaches the formula and the three-minute example, and marks the 'starts at 4' sentence as uncertain.",
        ], ["priority"]],
      ],
      flow: flow("Age a contact", ["Arrive", "30s", "1 min", "3 min"], [
        step("Arrive", "Arrive", "Priority 4", "Initial 4, acceleration 1, time 0.", { value: "4" }),
        step("Arrive", "30s", "Priority 4.5", "The page's half-step.", { value: "4.5" }),
        step("30s", "1 min", "Priority 5", "One full acceleration.", { value: "5" }),
        step("1 min", "3 min", "Priority 7", "The worked example.", { value: "7" }),
      ]),
      quiz: [
        ["Formula?", ["(Time × Acceleration) + Initial Priority", "Time + Proficiency", "Initial × Maximum", "AHT / agents"], 0, "Printed on the static delivery page.", "priority"],
        ["Initial 4, acceleration 1, three minutes?", ["7", "4", "12", "3"], 0, "The page's example.", "priority"],
        ["Acceleration 1 after 30 seconds adds…", ["0.5", "30", "1", "0"], 0, "Priority increments in seconds. The page says so.", "priority"],
        ["Default acceleration?", ["1", "0", "20", "90"], 0, "Minimum 0. Personal Connection is the special case that wants 0.", "priority"],
        ["Maximum priority…", ["Caps the result", "Is proficiency", "Replaces initial priority always", "Is the DNIS"], 0, "The page says the maximum is that field.", "priority"],
        ["Skill A initial 1 acceleration 5, after one minute?", ["6", "1", "5", "20"], 0, "(1 × 5) + 1 = 6. That part of the story matches.", "priority"],
      ],
      cards: [
        ["Time in minutes", "So 30 seconds is 0.5."],
        ["Default acceleration", "1."],
        ["Cap", "Maximum Priority."],
        ["Uncertain sentence", "Skill B 'starts at 4' from an initial of 3. Formula says 3."],
      ],
      lab: ["Use the simulator formula", "Match 7, then cap it.", [
        "Open the routing simulator. Initial 4, acceleration 1, maximum 1000.",
        "Step to three minutes of wait and read priority 7.",
        "Set maximum to 5 and confirm the trace does not climb past 5.",
        "Switch mode to Personal Connection and confirm this lab forces acceleration 0.",
      ], "The numbers match the help page."],
      faults: [
        ["Priority never moves", "A contact sits and its priority stays at the initial value on an inbound skill.", "initial=4 acceleration=0 mode=inbound wait=180 priority=4", "Acceleration 0 is the Personal Connection setting. Inbound skills normally use a positive acceleration if they should age.", "Set the inbound acceleration you intended. Do not copy the PC rule onto inbound.", "priority"],
      ],
      uncertain: ["The overtakes-example says Skill B starts at priority 4 when its initial priority is 3. The formula on the same page does not produce 4 at time zero. Marked uncertain."],
    }),
    quick({
      id: "bullseye-prof",
      title: "Bullseye with proficiency",
      level: "intermediate", minutes: 12,
      summary: "Bullseye adds and removes agents by proficiency, routing attributes, or both. COUNTAGENTS, GETQUEUE, REQAGENT, and UpdateContact can carry it.",
      objectives: ["Configure the opening window", "Widen it on purpose", "Name the four actions"],
      figure: rings("Widen, do not hope", [
        { label: "1–5", note: "first" },
        { label: "6–8", note: "added" },
      ], [{ name: "Best", prof: 1 }, { name: "Later", prof: 8 }]),
      sections: [
        ["Two methods", [
          "Bullseye can use skill proficiency, routing attributes, or both. Proficiency is assigned with the skill. Attributes are custom traits, such as a language, that narrow or widen the same skill's pool.",
          "The page's key facts: assign proficiency on the user profile or the skill record, and configure bullseye on COUNTAGENTS, GETQUEUE, REQAGENT, and UpdateContact.",
        ], ["bullseye"]],
        ["WFM warning", [
          "If you use WFM, read that product's guidance first. CXone WFM users are pointed at the online help. IEX users are pointed at the Distribution Rules Guide.",
          "A window that never widens protects quality and misses the service target. A window that starts at 1–20 does not prefer anyone. Both are configuration choices, not platform bugs.",
        ], ["bullseye"]],
      ],
      flow: flow("Attributes plus proficiency", ["Contact", "Skill", "Attribute", "Widen"], [
        step("Contact", "Skill", "Spanish skill", "Proficiency is fluency.", { high: "1", low: "5" }),
        step("Skill", "Attribute", "Language attribute", "The page's second method, combined with proficiency.", { both: "allowed" }),
        step("Attribute", "Widen", "UpdateContact", "Grow the proficiency side when wait grows.", { action: "UpdateContact" }),
        step("Widen", "Widen", "Or the other actions", "COUNTAGENTS, GETQUEUE, REQAGENT also support it.", { four: "yes" }),
      ]),
      quiz: [
        ["Which actions does the key-facts list name?", ["COUNTAGENTS, GETQUEUE, REQAGENT, UpdateContact", "BEGIN and HANGUP only", "MENU only", "TextBot Exchange only"], 0, "That is the list on the bullseye page.", "bullseye"],
        ["Routing attributes are…", ["Custom traits that narrow or widen the pool inside a skill", "The same as acceleration", "OAuth scopes", "DNIS values"], 0, "The page's example uses language beside fiction proficiency.", "bullseye"],
        ["You may use proficiency and attributes…", ["Together or separately", "Never together", "Only on digital", "Only in WFM"], 0, "The key facts say either or both.", "bullseye"],
        ["IEX customers should read…", ["The Distribution Rules Guide", "RFC 6749", "The Menu page only", "Nothing"], 0, "CXone WFM customers read the WFM help instead.", "bullseye"],
        ["A 1–20 opening window…", ["Does not prefer the strongest agents", "Is the Classics example", "Disables the skill", "Is required"], 0, "The Classics opening window is 1–5, then 1–8.", "bullseye"],
        ["Proficiency is assigned…", ["On the user profile or the skill record", "Only in Studio variables", "Only by the carrier", "Only in Credly"], 0, "Key facts on the bullseye page.", "bullseye"],
      ],
      cards: [
        ["Four actions", "COUNTAGENTS, GETQUEUE, REQAGENT, UpdateContact."],
        ["Attributes", "Custom traits, combined with proficiency if you want."],
        ["Classics", "1–5, then 1–8 after 90 seconds."],
        ["WFM first", "Read the forecast impact before you turn bullseye on."],
      ],
      lab: ["Build the pattern in Studio builder", "REQAGENT, MUSIC, UPDATECONTACT.", [
        "Load the Classics sample.",
        "Confirm high 1 low 5 on REQAGENT and high 1 low 8 on UPDATECONTACT.",
        "Validate. Fix any window outside 1–20.",
        "Export the lab JSON and label it not a Studio import.",
      ], "The sample matches the help page and the export disclaimer is visible."],
      faults: [
        ["Everyone eligible immediately", "Service complaints say new agents get the same calls as specialists.", "REQAGENT high=1 low=20\nUpdateContact=none", "The window started fully open. Bullseye never had a center.", "Set the opening window to the specialists and widen on UpdateContact.", "bullseye"],
      ],
    }),
    quick({
      id: "pc-zero",
      title: "Personal Connection acceleration is zero",
      level: "intermediate", minutes: 11,
      summary: "Personal Connection skills set acceleration to 0 because there is no queue of contacts. Initial priority still matters for blending. Dialing by proficiency is a separate pair of checkboxes.",
      objectives: ["Set PC acceleration to 0", "Keep initial priority for blending", "Find the proficiency dialing checkboxes"],
      figure: row("Inbound ages, PC does not", [
        { id: "i", label: "Inbound", sub: "acceleration > 0", tone: 1 },
        { id: "q", label: "Queue", sub: "contacts wait", tone: 2 },
        { id: "p", label: "PC skill", sub: "acceleration 0", tone: 4 },
        { id: "b", label: "Blend", sub: "initial priority", tone: 3 },
      ], [{ from: "i", to: "q", label: "ages" }, { from: "p", to: "b", label: "no queue" }]),
      sections: [
        ["Why zero", [
          "The static delivery page says: for Personal Connection skills, set acceleration to 0 because there is no queue of contacts. You can still set initial priority so one skill is considered ahead of another when blending.",
          "The same page notes an Outbound Engagement (SmartReach) skill where initial priority is, at the time of that writing, the only available priority setting. Do not assume every outbound product has the same three fields.",
        ], ["priority"]],
        ["Dialing by proficiency", [
          "Personal Connection can weight distribution by agent wait, simultaneous calls, and optionally proficiency. Enable Dialing by Proficiency on the business unit, under ACD Configuration > Business Units, Outbound Strategies. Then enable it on the skill's Parameters tab, General Pacing Settings.",
          "The page says you may change the default weights but should consult your account representative before you do. This lab does not publish replacement weights.",
        ], ["pc"]],
      ],
      flow: flow("Blend without a fake queue", ["PC", "Inbound", "Agent", "Weights"], [
        step("PC", "PC", "Acceleration 0", "No contact queue to age.", { initial: "still set" }),
        step("Inbound", "Inbound", "Acceleration 1 or your value", "Those contacts do age.", { do_not_copy: "the zero" }),
        step("PC", "Agent", "Initial priority", "How blending ranks the PC skill against inbound.", { field: "Initial Priority" }),
        step("Agent", "Weights", "Optional proficiency dialing", "Business unit, then skill. Ask before editing weights.", { consult: "account representative" }),
      ]),
      quiz: [
        ["PC acceleration should be…", ["0", "1", "5", "20"], 0, "Because there is no queue of contacts.", "priority"],
        ["Why keep initial priority on a PC skill?", ["Blending against other skills", "To age a queue that does not exist", "To set proficiency", "To name the DNIS"], 0, "The page says you can rank one skill ahead of another.", "priority"],
        ["SmartReach, on that page…", ["Has initial priority as the only priority setting mentioned", "Uses bullseye Music", "Is a CRM", "Is an IdP"], 0, "Do not copy the three inbound fields onto it without reading its page.", "priority"],
        ["Dialing by Proficiency is enabled in…", ["The business unit and the skill", "Studio only", "The POC only", "Credly"], 0, "Outbound Strategies, then the skill's General Pacing Settings.", "pc"],
        ["Default distribution weights…", ["Can be changed, but ask the account representative first", "Must be set to zero", "Are proficiencies", "Are public prices"], 0, "The page urges caution.", "pc"],
        ["Copying acceleration 0 onto an inbound skill…", ["Stops that inbound contact from aging", "Is required", "Enables WebRTC", "Fixes hold recording"], 0, "Zero is the PC rule.", "priority"],
      ],
      cards: [
        ["PC acceleration", "0. No contact queue."],
        ["Initial priority", "Still used when blending."],
        ["Two checkboxes", "Business unit, then skill, for dialing by proficiency."],
        ["Weights", "Do not edit defaults without the account representative."],
      ],
      lab: ["Set the simulator to PC", "Watch priority stay put.", [
        "Choose Personal Connection mode.",
        "Confirm the trace says acceleration is forced to 0.",
        "Compare with inbound mode at acceleration 1.",
        "Write one sentence on why blending still has an initial priority.",
      ], "You can explain the exception without reciting the whole dialer."],
      faults: [
        ["Outbound starves or never yields", "A PC skill was given acceleration 5 'so it would compete,' and inbound contacts jump the moment any PC activity exists, or the reverse complaint appears after someone zeroes an inbound skill.", "PC acceleration=5 inbound acceleration=0", "The page's rule is the opposite: PC at 0, inbound aging with its own acceleration, rank them with initial priority.", "Set PC acceleration to 0 and give inbound a real acceleration. Adjust initial priorities for the blend you want.", "priority"],
      ],
    }),
    quick({
      id: "attributes",
      title: "Routing attributes",
      level: "intermediate", minutes: 9,
      summary: "Attributes are custom traits on agents. The bullseye page uses language as the example beside proficiency. They are not skills, and they are not OAuth scopes.",
      objectives: ["Define an attribute with the page's words", "Combine it with proficiency", "Not invent the attribute admin URL"],
      figure: row("Skill plus trait", [
        { id: "k", label: "Skill", sub: "Fiction", tone: 4 },
        { id: "p", label: "Proficiency", sub: "how strong", tone: 1 },
        { id: "a", label: "Attribute", sub: "language", tone: 3 },
        { id: "c", label: "Contact", sub: "needs both", tone: 2 },
      ], [{ from: "k", to: "c", label: "" }, { from: "p", to: "c", label: "" }, { from: "a", to: "c", label: "" }]),
      sections: [
        ["The example", [
          "Marguerite uses proficiency for fiction-book knowledge and routing attributes for language. The combination is how she keeps the Classics experience specific without a separate skill for every pair.",
          "The page says you create and assign the attributes, then configure Studio actions to use them. It does not, in the section cited here, list every property on the attribute form. Do not invent required fields.",
        ], ["bullseye"]],
        ["Digital note", [
          "UPDATE CONTACT DIGITAL can replace routing criteria that Reqagent set earlier. Its default routing-criteria option is Not Applicable. Proficiency high and low are still 1–20.",
          "If you are on digital, read that action's page before you copy a voice UpdateContact property name across.",
        ], ["updateDigital"]],
      ],
      flow: flow("Add a language without a new skill", ["Admin", "Agent", "Script", "Contact"], [
        step("Admin", "Agent", "Assign the attribute", "Example from the page: language.", { also: "proficiency on the skill" }),
        step("Agent", "Script", "Use it in the action", "The bullseye actions are the ones named.", { confirm: "property names on the action page" }),
        step("Script", "Contact", "Narrow, then widen", "Attributes can move either way.", { with: "proficiency window" }),
        step("Contact", "Contact", "Digital variant", "Use the digital action's own page.", { default: "Not Applicable" }),
      ]),
      quiz: [
        ["The bullseye page's attribute example is…", ["Language, beside fiction proficiency", "A SIP header", "An access key", "A forecast model"], 0, "That is Marguerite's second method.", "bullseye"],
        ["Attributes replace skills.", ["False. They narrow or widen inside a skill.", "True", "Only for PC", "Only for MAX"], 0, "The page says within a skill.", "bullseye"],
        ["This lesson lists every attribute-form field.", ["No", "Yes", "Only the price", "Only the codec"], 0, "Those fields were not in the cited section.", "bullseye"],
        ["Digital routing-criteria default on Update Contact Digital?", ["Not Applicable", "Always replace", "Proficiency 20", "Acceleration 1"], 0, "The action page says the default option is Not Applicable.", "updateDigital"],
        ["High and low on that digital action are…", ["1 to 20, 1 best", "0 to 100", "Letters", "Seconds"], 0, "Same scale as voice bullseye.", "updateDigital"],
        ["You can widen with attributes.", ["Yes. The page says narrow or broaden.", "No, only proficiency widens", "No, attributes are permanent", "Only IEX can"], 0, "Both directions are the point of bullseye.", "bullseye"],
      ],
      cards: [
        ["Attribute", "A custom trait. The example is language."],
        ["Inside a skill", "Not a substitute for the skill itself."],
        ["Not Applicable", "Default routing-criteria choice on the digital update action."],
        ["Do not invent fields", "Open the action page for property names."],
      ],
      lab: ["Write a pair", "One skill, two traits.", [
        "Skill: Loans. Proficiency: product knowledge, 1–5 then 1–10.",
        "Attribute: language, from the page's idea, not a new skill per language.",
        "Write 'confirm attribute properties on the current help page' under the attribute.",
        "Add the WFM footnote.",
      ], "You did not create a skill matrix you cannot staff."],
      faults: [
        ["A skill per dialect", "Fifty skills exist for one line of business and WFM cannot forecast them.", "skills=Loans_es_MX, Loans_es_ES, … count=50", "The bullseye page's pattern is one skill plus an attribute, plus proficiency.", "Collapse to a skill and a language attribute after you read the WFM guidance. Do not mass-delete without a routing plan.", "bullseye"],
      ],
    }),
    quick({
      id: "static-delivery",
      title: "Static delivery priorities",
      level: "intermediate", minutes: 9,
      summary: "The priority page is filed under static delivery. Inbound and digital skills can use the three settings. Personal Connection with priority blending uses a different trio of priority fields.",
      objectives: ["Use the right fields per skill type", "Not paste inbound fields onto SmartReach", "Keep the formula for inbound"],
      figure: row("Field sets differ", [
        { id: "i", label: "Inbound", sub: "initial, accel, max", tone: 1 },
        { id: "d", label: "Digital", sub: "same three, page says", tone: 3 },
        { id: "p", label: "PC blend", sub: "different priority fields", tone: 2 },
        { id: "s", label: "SmartReach", sub: "initial only, then", tone: 4 },
      ], [{ from: "i", to: "d", label: "page groups these" }, { from: "p", to: "s", label: "not the same" }]),
      sections: [
        ["Read the skill type first", [
          "The static delivery page says an inbound or digital skill can use the three settings. A Personal Connection skill with priority blending uses Initial Priority, Priority Initial Priority, and Reschedule Priority instead. The awkward repeated name is how that sentence is written. Confirm the labels on the live form.",
          "An Outbound Engagement (SmartReach) skill, on that page, has initial priority as the only available priority setting.",
        ], ["priority"]],
        ["Digital acceleration is not universal", [
          "Voice inbound uses the time-and-acceleration formula. UPDATE CONTACT DIGITAL says digital priority has no acceleration or priority management, and workflow automation is how you change it.",
          "So 'digital skill' on the static delivery page and 'digital script priority' on the Studio action are two sentences you should not mash together. Read both before you set a number.",
        ], ["priority", "updateDigital"]],
      ],
      flow: flow("Pick the field set", ["Skill type", "Page", "Fields", "Script"], [
        step("Skill type", "Page", "Inbound or digital skill record", "Three settings, if you are on the static delivery page.", { formula: "voice aging" }),
        step("Skill type", "Page", "PC with blending", "The other priority trio. Acceleration 0 still applies.", { confirm: "labels on the form" }),
        step("Skill type", "Page", "SmartReach", "Initial priority only, per that page.", { do_not: "invent acceleration" }),
        step("Script", "Script", "Digital action", "No acceleration inside Update Contact Digital.", { use: "WFA if needed" }),
      ]),
      quiz: [
        ["Inbound skills on the static delivery page use…", ["Initial, acceleration, and maximum", "Only reschedule priority", "Only a routing queue", "No priority"], 0, "The page says configure all three as needed.", "priority"],
        ["PC with priority blending uses…", ["Initial Priority, Priority Initial Priority, and Reschedule Priority", "The inbound trio only", "Proficiency instead of all priority", "A Menu variable"], 0, "That is the page's list. Confirm the live labels.", "priority"],
        ["SmartReach on that page…", ["Initial priority only", "The full trio", "Bullseye rings", "ScreenAgent"], 0, "Do not add fields the page does not list.", "priority"],
        ["Update Contact Digital and acceleration?", ["No acceleration. Use workflow automation to change priority.", "Same formula as voice", "Acceleration defaults to 5", "Acceleration is proficiency"], 0, "The action page says so.", "updateDigital"],
        ["Digital skill record versus digital script action…", ["Are described on two pages that you should both read", "Are identical in every field", "Do not exist", "Are WFM screens"], 0, "This lesson refuses to collapse them.", "priority"],
        ["PC acceleration remains…", ["0", "Equal to the inbound skill", "20", "The maximum priority"], 0, "No contact queue.", "priority"],
      ],
      cards: [
        ["Three settings", "Initial, acceleration, maximum, for inbound on that page."],
        ["PC blending trio", "A different set of priority fields. Check the form."],
        ["SmartReach", "Initial only, in the passage cited."],
        ["Digital action", "No acceleration. WFA if you must change priority."],
      ],
      lab: ["Make a field card per skill", "Four skills, four cards.", [
        "Inbound phone: three fields and the formula.",
        "PC: acceleration 0 and the blending field names, marked 'confirm labels'.",
        "SmartReach: initial only.",
        "Digital script: no acceleration on the update action.",
      ], "No card borrows another's fields."],
      faults: [
        ["Acceleration on a digital action", "A digital script sets acceleration and the contact's place never changes the way the designer expected.", "action=UpdateContactDigital acceleration=5\npage=no acceleration for digital", "The voice formula was pasted onto the digital action.", "Remove it. Use workflow automation if digital priority must move, and set the skill-record fields only where that page allows them.", "updateDigital"],
      ],
      uncertain: ["The static delivery page's PC field 'Priority Initial Priority' is an unusual repeated name in the retrieved text. Confirm the labels in the product before you write them into a worksheet."],
    }),
    quick({
      id: "blend-and-forecast",
      title: "Blending, bullseye, and the forecast",
      level: "advanced", minutes: 11,
      summary: "Initial priority ranks work when you blend. Bullseye changes who can take it. The forecast assumed a pool. Change one and you owe the WFM team a look.",
      objectives: ["Rank blended work with initial priority", "Tell WFM when the pool changes", "Use What-If rather than a silent edit"],
      figure: row("Three levers", [
        { id: "i", label: "Initial", sub: "blend rank", tone: 2 },
        { id: "b", label: "Bullseye", sub: "who is eligible", tone: 3 },
        { id: "f", label: "Forecast", sub: "who was staffed", tone: 4 },
        { id: "w", label: "What-If", sub: "a parallel plan", tone: 1 },
      ], [{ from: "i", to: "f", label: "volume mix" }, { from: "b", to: "f", label: "pool" }, { from: "f", to: "w", label: "alternate" }]),
      sections: [
        ["What WFM can do about a change", [
          "General Forecast lets you build alternative forecasts with What-If, using the same parameters and history while you change forecast data. You can compare staffing plans. The page also says forecast data is regenerated after staffing parameters, because scheduling units that can handle the work are considered.",
          "That is the official place to look at a different future. It is not a promise that What-If understands bullseye windows. The bullseye page still says to read the WFM guidance.",
        ], ["forecast", "bullseye"]],
        ["A practical order", [
          "Write the routing change: new initial priorities, new windows. Then ask WFM to look at history, AHT, and the service target before the schedule is published.",
          "CXone WFM says it supports tenants up to 10,000 agents, and that Scheduling, Forecasting, Intraday, Real-Time Adherence, Time Off, and Reporting are certified at that scale. A routing change is still a forecast change at 50 agents.",
        ], ["wfm"]],
      ],
      flow: flow("Change routing with WFM in the room", ["Routing", "Note", "WFM", "Schedule"], [
        step("Routing", "Note", "Write the window and the priorities", "Include PC at acceleration 0 if outbound is in the blend.", { cite: "both pages" }),
        step("Note", "WFM", "Open the guidance", "CXone WFM help or the IEX distribution rules.", { before: "go-live" }),
        step("WFM", "WFM", "What-If if it helps", "Parallel forecast, same history.", { not: "a silent overwrite" }),
        step("WFM", "Schedule", "Publish", "Intraday will show if the pool was wrong.", { scale: "up to 10,000" }),
      ]),
      quiz: [
        ["What-If on the forecast page…", ["Builds an alternate from the same parameters and history while you change forecast data", "Changes bullseye inside Studio", "Issues access keys", "Sets acceleration"], 0, "You can run parallel forecasts.", "forecast"],
        ["Does What-If replace the bullseye warning?", ["No. Read the WFM guidance too.", "Yes", "Only above 10,000 agents", "Only for PC"], 0, "The bullseye page is separate.", "bullseye"],
        ["CXone WFM scale statement?", ["Up to 10,000 agents, with the modules listed on the welcome page", "100 agents", "Unlimited with no statement", "10 agents"], 0, "Scheduling, Forecasting, Intraday, Real-Time Adherence, Time Off, and Reporting.", "wfm"],
        ["Blended rank uses…", ["Initial priority, with PC acceleration at 0", "Proficiency alone", "The DNIS", "ScreenAgent"], 0, "From the priority page.", "priority"],
        ["Forecast data is regenerated after staffing parameters because…", ["Scheduling units that can handle the work are considered", "OAuth expired", "Hold recording stopped", "The menu variable changed"], 0, "The forecast page describes the two stages.", "forecast"],
        ["A 50-agent team can ignore WFM when bullseye changes.", ["False", "True", "True if they use MAX", "True if acceleration is 1"], 0, "The warning is not limited to the 10,000-agent sentence.", "bullseye"],
      ],
      cards: [
        ["What-If", "A parallel forecast. Same history, changed data."],
        ["Two stages", "Forecast data, then again after staffing parameters."],
        ["10,000", "The scale the WFM welcome page states."],
        ["Tell WFM", "A new window is a new pool."],
      ],
      lab: ["Write the change note", "Half a page, three headings.", [
        "Routing: initial priorities and the proficiency window.",
        "Exception: PC acceleration 0.",
        "Ask: which WFM product, and will What-If be used.",
        "Do not include a fake staffing number.",
      ], "WFM can answer without decoding a script screenshot."],
      faults: [
        ["Schedule misses the new pool", "Monday's Spanish schedule staffs only the proficiency 1–3 group after the script widened to 12.", "window=1–12\nschedule source=old forecast\nWFM not told", "Bullseye changed eligibility and the plan did not.", "Re-run the forecast conversation and the WFM guidance before the next publish.", "bullseye"],
      ],
    }),
    quick({
      id: "delivery-tie",
      title: "What this lab will not claim about delivery",
      level: "advanced", minutes: 8,
      summary: "The simulator breaks ties by longest idle. Personal Connection documents wait time, simultaneous calls, and optional proficiency. A universal inbound tie-break is not stated on the pages cited here.",
      objectives: ["Say the classroom tie-break out loud", "Quote the PC factors", "Refuse a fake 'always longest idle' policy"],
      figure: row("Documented versus classroom", [
        { id: "p", label: "Priority", sub: "documented", tone: 4 },
        { id: "w", label: "Window", sub: "documented", tone: 1 },
        { id: "t", label: "Tie-break", sub: "classroom", tone: 2 },
        { id: "c", label: "PC factors", sub: "documented", tone: 3 },
      ], [{ from: "p", to: "w", label: "then" }, { from: "w", to: "t", label: "sim only" }]),
      sections: [
        ["PC is specific", [
          "The proactive voice page says PC distributes calls using the agent's wait time, current simultaneous calls, and optionally proficiency. Weights are the distribution factors you should not edit casually.",
          "That sentence is about Personal Connection. It is not a description of every inbound ACD delivery mode.",
        ], ["pc"]],
        ["The simulator's label", [
          "This lab's routing simulator, after priority and the proficiency window, picks the longest current idle agent. That rule is labeled in the tool. It is not a citation.",
          "If a production question is 'who among three eligible agents gets the contact,' open the current delivery help for that skill type. Do not answer from the simulator.",
        ], ["priority", "bullseye"]],
      ],
      flow: flow("Answer only what is cited", ["Question", "Priority", "Window", "Tie"], [
        step("Question", "Priority", "Who jumps the queue", "Use the formula.", { cited: "yes" }),
        step("Priority", "Window", "Who is eligible", "Use high and low proficiency.", { cited: "yes" }),
        step("Window", "Tie", "Who among equals", "PC: the documented factors. Inbound: look it up.", { sim: "longest idle, labeled" }),
        step("Tie", "Tie", "Do not promote the sim", "A lab trace is not a policy.", { stamp: "classroom" }),
      ]),
      quiz: [
        ["PC distribution factors named on the proactive voice page?", ["Wait time, simultaneous calls, and optional proficiency", "Only the menu digit", "Only AHT", "Only the access key"], 0, "Weights change how those factors combine. Ask before editing them.", "pc"],
        ["The simulator's tie-break is…", ["A classroom rule: longest idle", "A quoted inbound policy", "RFC 3261", "Always proficiency 20"], 0, "The tool says so. The help pages cited here do not.", "bullseye"],
        ["Is longest idle safe to write into an inbound design with no further citation?", ["No", "Yes", "Yes for digital", "Yes for FedRAMP"], 0, "Look up the delivery mode.", "priority"],
        ["Priority still decides which contact is ahead.", ["Yes, using the documented formula", "No", "Only on PC", "Only for screen recording"], 0, "That part is cited.", "priority"],
        ["The proficiency window still decides eligibility for bullseye.", ["Yes", "No", "Only if acceleration is 0", "Only for supervisors"], 0, "That part is cited.", "bullseye"],
        ["Editing PC weights…", ["Requires caution and the account representative", "Is free of consequences", "Is done in Menu", "Is a Credly task"], 0, "The page says so.", "pc"],
      ],
      cards: [
        ["Cited", "Priority formula. Bullseye window. PC's three factors."],
        ["Not cited", "A single inbound tie-break for every delivery mode."],
        ["Simulator", "Longest idle, on purpose, labeled."],
        ["Weights", "PC distribution factors. Do not freelance."],
      ],
      lab: ["Annotate a trace", "Mark each line cited or classroom.", [
        "Run the simulator until a delivery.",
        "Underline the priority number and write the formula URL.",
        "Underline the window and write the bullseye URL.",
        "Underline the agent name and write 'classroom tie-break'.",
      ], "The trace cannot be pasted into a design as policy."],
      faults: [
        ["Policy copied from the sim", "A standard says 'CXone always delivers to the longest-idle agent' and specialists at proficiency 1 are idle while a long-idle proficiency 9 takes the call inside a wide window.", "standard=longest idle always\nwindow=1–20", "The standard came from this lab's tie-break, and the window was fully open.", "Delete the fake standard. Set a real window. Look up delivery for anything the formula and the window do not answer.", "bullseye"],
      ],
    }),
  ]),
];
