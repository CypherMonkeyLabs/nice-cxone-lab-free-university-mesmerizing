import { quick, row, rings, flow, step } from "./shape.mjs";

const P = ["Admin", "Role", "Employee", "Feature"];
const A = ["Admin", "Skill", "Script", "POC", "Caller"];

function track(id, title, blurb, accent, lessons) {
  return { id, title, blurb, accent, lessons };
}

export const part2 = [
  track("platform", "Platform, licensing, and releases", "Tenants, roles, access keys, and how to read a release note without sanding off the dates.", 2, [
    quick({
      id: "admin-app",
      title: "The Admin application",
      level: "foundation", minutes: 11,
      summary: "Admin is where employees, roles, login authenticators, and access keys are managed. The app selector is how you get there.",
      objectives: ["Open Admin on purpose", "List what Admin owns", "Leave ACD skills for the ACD application"],
      figure: row("Admin beside ACD", [
        { id: "s", label: "App selector", sub: "switcher", tone: 1 },
        { id: "a", label: "Admin", sub: "people, keys", tone: 2 },
        { id: "c", label: "ACD", sub: "skills, POCs", tone: 4 },
        { id: "u", label: "Employee", sub: "one profile", tone: 3 },
      ], [{ from: "s", to: "a", label: "open" }, { from: "a", to: "u", label: "create" }, { from: "s", to: "c", label: "routing" }]),
      sections: [
        ["What the welcome page assigns to Admin", [
          "The users and security page says the Admin application manages general components of the system. The key areas it names are employees, tenant-level settings and security, storage options, and recordings. Security and data access are managed with roles, views, login authenticators, and access keys.",
          "Creating an inbound skill is not an Admin task. Set Up Inbound Voice starts in the ACD application, under Contact Settings. If a runbook mixes those two apps, the buttons will not be where the runbook says.",
        ], ["admin", "inbound"]],
        ["One employee, one primary role", [
          "Every employee must have a minimum of one role. A secondary role is allowed when a person needs one. Permissions on the role decide which features, data, and applications that person can open.",
          "Getting Started uses the same employee object for an API user. You still create the profile in Admin. A back-end integration user should not receive a login authenticator.",
        ], ["admin", "gettingStarted"]],
      ],
      flow: flow("Create a person in the right application", P, [
        step("Admin", "Role", "Open the app selector", "Choose Admin, not ACD, for a new employee.", { app: "Admin" }),
        step("Role", "Employee", "Require one role", "The welcome page says at least one role.", { secondary: "optional" }),
        step("Employee", "Feature", "Permissions follow the role", "Agents and administrators differ by permission, not by a separate product login.", { scope: "least privilege" }),
        step("Admin", "Employee", "Skip the authenticator for a bot user", "Back-end API accounts must not have a login authenticator.", { authenticator: "none" }),
      ]),
      quiz: [
        ["Which application does the welcome page name for employees and roles?", ["Admin", "Studio", "Personal Connection", "Forecasting"], 0, "Admin manages employees, tenant settings, security, storage, and recordings.", "admin"],
        ["Where do you create an inbound phone skill?", ["ACD, Contact Settings, ACD Skills", "Admin, Employees", "The developer portal", "WFM Forecasting"], 0, "Set Up Inbound Voice starts in the ACD application.", "inbound"],
        ["How many roles must an employee have?", ["At least one", "None", "Exactly three", "One per skill"], 0, "The welcome page says a minimum of one role, with secondary roles optional.", "admin"],
        ["A back-end API employee should have which login authenticator?", ["None", "The same authenticator as agents", "SAML only", "A password that is also the access key"], 0, "Getting Started says accounts for back-end applications should not have a login authenticator.", "gettingStarted"],
        ["Secondary roles exist for what?", ["Users who need an additional role", "Every agent, automatically", "Points of contact", "SIP trunks"], 0, "The welcome page allows a secondary role when required.", "admin"],
        ["Recordings are named as whose concern on the Admin welcome page?", ["Admin, among storage and security", "Only Studio", "Only the carrier", "Only Personal Connection"], 0, "The key areas include storage options and recordings.", "admin"],
      ],
      cards: [
        ["App selector", "The switcher that opens Admin, ACD, and the other applications."],
        ["Admin", "Employees, roles, authenticators, access keys, storage, recordings."],
        ["ACD application", "Skills, points of contact, and the inbound voice setup path."],
        ["Primary role", "Required on every employee. Permissions ride on the role."],
      ],
      lab: ["Split a runbook in two", "Stop mixing Admin clicks with ACD clicks.", [
        "Take a messy setup list and draw a line down the page.",
        "Put employees, roles, and access keys on the Admin side.",
        "Put skills, scripts, and points of contact on the ACD side.",
        "Write 'no login authenticator' next to any API employee.",
      ], "The list can be followed without opening the wrong application."],
      faults: [
        ["Skill button missing", "A new administrator cannot find Create Skill.", "app=Admin path=Employees\nexpected=ACD > Contact Settings > ACD Skills", "They are in Admin. Skills are created in ACD.", "Use the app selector and open ACD. The permission is ACD > Skills Create, Edit.", "inbound"],
      ],
    }),
    quick({
      id: "licenses",
      title: "Licenses the help pages actually name",
      level: "foundation", minutes: 12,
      summary: "Some features say they need a license. This floor lists only licenses a cited page names, and it does not invent SKUs or prices.",
      objectives: ["Treat a license sentence as a gate", "Name three licenses the pages state", "Refuse a price that is not published here"],
      figure: row("A license gate in front of a feature", [
        { id: "l", label: "License", sub: "named on the page", tone: 2 },
        { id: "f", label: "Feature", sub: "hidden without it", tone: 1 },
        { id: "r", label: "Role", sub: "still required", tone: 3 },
        { id: "e", label: "Employee", sub: "attribute", tone: 4 },
      ], [{ from: "l", to: "f", label: "enables" }, { from: "r", to: "f", label: "permits" }, { from: "e", to: "f", label: "may bill" }]),
      sections: [
        ["Pages that name a license", [
          "CRM Ticketing says the feature is available if you have a CRM Ticketing license. Migrated Calls refers to an Interactions Upload license and to Admin > Recording > Upload Migrated Interactions permissions. AutoSummary setup says you must work with your account representative and that AutoSummary must be enabled. To use it with MAX rather than an agent application, you also need a Copilot for Agents license.",
          "Salesforce integration says you are billed for CRM integration based on the number of employees with the Agent Integrations attribute enabled. That is a billing sentence, not a public price list.",
        ], ["crmTicket", "migrated", "autosummarySetup", "sfAgent"]],
        ["What this lab will not add", [
          "Release notes say you may need to purchase a license or join a public preview to use some features. They do not publish a catalog of SKUs in the passages used here.",
          "If a design names a SKU this floor has not cited, mark it unknown and ask the account representative. Do not copy a SKU from memory into a statement of work.",
        ], ["rel263"]],
      ],
      flow: flow("Check the gate before the button", ["Page", "License", "Permission", "Attribute"], [
        step("Page", "License", "Read the first requirement", "The feature page names the license if there is one.", { example: "CRM Ticketing" }),
        step("License", "Permission", "Role still matters", "A license does not replace a permission such as Ticket Search.", { permission: "Search & Playback > Search > Ticket Search" }),
        step("Permission", "Attribute", "Some products bill per employee", "Agent Integrations is an employee attribute.", { billing: "per enabled employee" }),
        step("Attribute", "Attribute", "Ask, do not invent", "AutoSummary enablement goes through the account representative.", { sku: "not published here" }),
      ]),
      quiz: [
        ["CRM Ticketing requires which license, in the page's words?", ["A CRM Ticketing license", "A free community edition", "An Avaya CMS license only", "No license is mentioned"], 0, "The page states the license and the Ticket Search permission.", "crmTicket"],
        ["Migrated Calls refers to which upload license?", ["Interactions Upload", "A SIP trunk license", "An OAuth client secret", "A WFM seat"], 0, "It also names Admin > Recording > Upload Migrated Interactions permissions.", "migrated"],
        ["AutoSummary on MAX, rather than an agent application, also needs what?", ["A Copilot for Agents license", "Only a phone skill", "RFC 3261", "A new routing queue"], 0, "The setup page says this explicitly.", "autosummarySetup"],
        ["How does the Salesforce page describe CRM integration billing?", ["By the number of employees with Agent Integrations enabled", "A flat fee printed on the help page", "Per SIP trunk", "It says billing does not apply"], 0, "There is no price figure on that page.", "sfAgent"],
        ["Does the 26.3 release note promise every listed feature to every tenant?", ["No. A license or public preview may be required, and features can change.", "Yes. All features ship to all tenants on day one.", "Only if acceleration is 1.", "Only government tenants."], 0, "That caveat is on the release notes pages.", "rel263"],
        ["Should this lab invent a SKU name?", ["No.", "Yes, if the feature is popular.", "Yes, for training only.", "Only for WFM."], 0, "Uncited SKUs are marked unknown.", "rel263"],
      ],
      cards: [
        ["CRM Ticketing license", "Named gate for the ticketing integration."],
        ["Interactions Upload", "Named on Migrated Calls, plus a recording permission."],
        ["Copilot for Agents license", "Required to use AutoSummary with MAX."],
        ["Agent Integrations attribute", "Enables the Salesforce path and is how billing is counted."],
      ],
      lab: ["Build a gate checklist", "Three columns: license, permission, attribute.", [
        "Pick CRM Ticketing, Migrated Calls, and AutoSummary.",
        "Write only the license sentence you can point at.",
        "Add the permission or attribute the same page names.",
        "Leave price blank.",
      ], "A blank price is the correct price."],
      faults: [
        ["SKU pasted from a blog", "A statement of work lists a SKU nobody can find in the tenant.", "sow=CX-AUTOSUM-STD-100\nhelp page=no SKU, 'account representative'", "The SKU was not on the cited help page.", "Replace it with the page's words: enablement through the account representative, plus the Copilot license if agents use MAX.", "autosummarySetup"],
      ],
    }),
    quick({
      id: "least-privilege",
      title: "Roles and least privilege",
      level: "foundation", minutes: 12,
      summary: "Permissions live on roles. An API user gets a unique role with only the permissions the integration uses. An access key inherits that power.",
      objectives: ["Put permissions on roles", "Build a narrow role for a connector", "Remember a key is as powerful as its user"],
      figure: row("Role, then key", [
        { id: "r", label: "Role", sub: "few permissions", tone: 4 },
        { id: "e", label: "Employee", sub: "API user", tone: 1 },
        { id: "k", label: "Access key", sub: "inherits", tone: 2 },
        { id: "a", label: "API", sub: "calls", tone: 3 },
      ], [{ from: "r", to: "e", label: "assign" }, { from: "e", to: "k", label: "generate" }, { from: "k", to: "a", label: "bearer" }]),
      sections: [
        ["The admin model", [
          "Security settings that control what users can see and do are roles and permissions. Access to recordings, reports, interactions, dashboards, and admin tools is typically permission-based. An agent may see only their own interactions. A supervisor may see a team.",
          "Getting Started's best practice for a back-end app is a unique role with the minimum permissions for the actions the app performs, and no login authenticator.",
        ], ["admin", "gettingStarted"]],
        ["The Avaya connector does it the same way", [
          "The Avaya CMS page tells you to create a role for the connector and an employee for the connector, then generate the access key on that employee. The legacy page warns that the key receives all permissions of the user who generates it. An administrator's key is an administrator's key.",
          "If the secret is lost, you create a new one. The secret is shown so you can copy it, and you will not see it again later.",
        ], ["avaya", "avayaLegacy", "keys"]],
      ],
      flow: flow("Issue a connector key", ["Admin", "Role", "Employee", "Key"], [
        step("Admin", "Role", "New role", "Name it for the connector. Enable only the service permissions.", { example: "Role for AvayaCMS ACD" }),
        step("Role", "Employee", "New employee", "No extra features. Activate the account so the Access Keys tab exists.", { authenticator: "none for pure API" }),
        step("Employee", "Key", "Generate", "Copy the id and the secret immediately.", { secret: "shown once" }),
        step("Key", "Key", "Disable later", "A disabled key's tokens stop at once and cannot be refreshed.", { effect: "immediate" }),
      ]),
      quiz: [
        ["Where do feature permissions live?", ["On roles", "On the SIP trunk", "On the point of contact", "Inside Studio actions only"], 0, "The Admin page says roles are assigned permissions.", "admin"],
        ["What does an access key inherit?", ["The permissions of the employee it was generated on", "Tenant-wide admin, always", "Nothing; keys are anonymous", "Only reporting, always"], 0, "The legacy Avaya page warns that an admin who generates a key gives admin power to the key.", "avayaLegacy"],
        ["Best practice for an integration role?", ["Only the permissions the app uses", "A copy of the administrator role", "No role", "Every ACD permission, for safety"], 0, "Getting Started says minimum permissions.", "gettingStarted"],
        ["If you lose the secret, what does the help say to do?", ["Create a new key", "Call the token endpoint with an empty password", "Read it back from the employee the next day", "Reuse another employee's secret"], 0, "Manage Access Keys and the Avaya pages agree the secret is not shown again.", "keys"],
        ["What happens when an access key is disabled?", ["Tokens from that key stop immediately and cannot be refreshed", "They keep working until expires_in", "Only new tokens fail", "Nothing until the next major release"], 0, "Manage Access Keys describes instant checks.", "keys"],
        ["An agent viewing only their own interactions is an example of what?", ["Permission-based data access", "A SIP failure", "Bullseye", "A missing DNIS"], 0, "The Admin page uses that example.", "admin"],
      ],
      cards: [
        ["Role", "The object that holds permissions."],
        ["Least privilege", "A unique role limited to what the integration does."],
        ["Secret shown once", "Copy it then. A lost secret means a new key."],
        ["Disable is immediate", "Existing tokens from that key stop."],
      ],
      lab: ["Draw the inheritance", "Show why you never generate a connector key as yourself.", [
        "Write your administrator role on the left and a connector role with two permissions on the right.",
        "Generate an imaginary key under each.",
        "Circle the administrator key and write 'this is an admin credential'.",
        "Add the disable test: turn the key off and expect calls to fail at once.",
      ], "The picture argues against shared admin keys."],
      faults: [
        ["Connector running as admin", "A compromised connector account can edit employees.", "employee=svc-avaya role=Administrator\nkey=active", "The key was generated on an administrator, which the legacy page tells you not to do.", "Create a dedicated role and employee, generate a new key there, and disable the old key.", "avayaLegacy"],
      ],
    }),
    quick({
      id: "external-idp",
      title: "External identity providers",
      level: "intermediate", minutes: 13,
      summary: "Users can authenticate with an external IdP. Applications authenticate with access keys. The help page lists the OIDC endpoints you copy from the IdP, including end-session for single logout.",
      objectives: ["Separate user login from app login", "Name the endpoints the page lists", "Keep SAML support inside what a release note said"],
      figure: row("User path and app path", [
        { id: "u", label: "User", sub: "browser login", tone: 1 },
        { id: "i", label: "IdP", sub: "OIDC or SAML", tone: 3 },
        { id: "c", label: "CXone", sub: "session", tone: 4 },
        { id: "p", label: "App", sub: "access key", tone: 2 },
      ], [{ from: "u", to: "i", label: "login" }, { from: "i", to: "c", label: "token" }, { from: "p", to: "c", label: "key" }]),
      sections: [
        ["What the external IdP page asks for", [
          "If you do not have a discovery document, the external IdP page tells you to enter Issuer, JsonWebKeySet, Authorization, Token, UserInfo, Revocation, and End Session endpoints. End Session is how a logout from CXone Mpower can also log the user out of the IdP, if you whitelist the sign-out redirect URI at the IdP.",
          "The same page says users and applications authenticate in similar ways, with one difference: applications use an access key, and users use a username and password. Applications are not required to use a browser. They are often back-office jobs or virtual agents.",
        ], ["idp"]],
        ["SAML, cited carefully", [
          "The French 25.4 release notes describe global authentication support for sign-in started at an external SAML 2.0 IdP, and they name Microsoft Entra ID and OneLogin among supported providers. That passage was retrieved in French.",
          "Use the current English authentication page before you tell a customer a specific IdP is on the supported list. The endpoint list above is from the English external IdP page and does not depend on that translation.",
        ], ["fr254", "idp"]],
      ],
      flow: flow("A user signs in through an IdP", ["User", "IdP", "CXone", "App"], [
        step("User", "IdP", "Start at the IdP or at CXone", "The page supports an external identity provider.", { protocol: "OIDC endpoints" }),
        step("IdP", "CXone", "Token and userinfo", "Copy the endpoints the page names.", { end_session: "single logout" }),
        step("CXone", "User", "Session", "Logout can return to the IdP if the redirect URI is whitelisted.", { whitelist: "sign-out redirect" }),
        step("App", "CXone", "Different path", "A bot uses an access key, not the person's password.", { no_browser: "typical" }),
      ]),
      quiz: [
        ["Which endpoint supports single logout on the external IdP page?", ["End Session", "The SIP trunk", "Bullseye HighProficiency", "The forecast staffing step"], 0, "You must also whitelist the sign-out redirect URI at the IdP.", "idp"],
        ["How do applications authenticate, according to that page?", ["With an access key", "With the agent's password typed into the server", "With a DNIS", "They cannot authenticate"], 0, "Users use a username and password. Applications use a key and typically skip the browser.", "idp"],
        ["Name one endpoint the page lists besides token.", ["JsonWebKeySet, or UserInfo, or Revocation, or Authorization", "REQAGENT", "AW-HDS-DDS", "ScreenAgent"], 0, "The page lists Issuer, JWKS, Authorization, Token, UserInfo, Revocation, and End Session.", "idp"],
        ["Does this lab treat the French SAML note as the English supported-IdP list?", ["No. It is marked as a French release-note passage.", "Yes. It overrides the English page.", "SAML is unsupported.", "SAML replaced OAuth."], 0, "Confirm the current English list before a design review.", "fr254"],
        ["A virtual agent that calls APIs with no user present should be set up as what?", ["An application employee with an access key", "A copy of a supervisor login", "A point of contact", "A routing queue"], 0, "The page says applications such as IVAs authenticate with access keys.", "idp"],
        ["Single logout fails if you forget what?", ["Whitelisting the sign-out redirect URI at the IdP", "Setting acceleration to 0", "Creating a digital skill", "Installing Softphone"], 0, "The page states that requirement.", "idp"],
      ],
      cards: [
        ["End Session", "IdP endpoint used for single logout."],
        ["Access key", "How an application authenticates. Not a person's password."],
        ["Whitelist", "The IdP must allow the sign-out redirect URI."],
        ["SAML note", "Described on the French 25.4 page. Confirm in English."],
      ],
      lab: ["Fill an endpoint sheet", "Copy names, not invented URLs.", [
        "List Issuer, JWKS, Authorization, Token, UserInfo, Revocation, and End Session.",
        "Leave the URL cells blank until you have the customer's IdP discovery document.",
        "Add a row for the sign-out redirect whitelist.",
        "Add a separate row for the integration user and its access key.",
      ], "The sheet has no guessed hostnames."],
      faults: [
        ["Users bounce back signed in", "Logout from CXone returns to a still-valid IdP session.", "end_session=configured\nidp whitelist=missing sign-out redirect", "The page says single logout needs that URI whitelisted.", "Add the redirect URI on the IdP and retry logout.", "idp"],
      ],
      uncertain: ["The supported SAML identity providers were read from the French 25.4 release notes, including Microsoft Entra ID and OneLogin. Confirm the current English list before you publish it internally."],
    }),
    quick({
      id: "public-preview",
      title: "Public Preview, formerly Controlled Release",
      level: "foundation", minutes: 9,
      summary: "Starting with the 26.3 release, the Controlled Release program is named Public Preview. Features on a release page may still require that program or a license.",
      objectives: ["Use the new name", "Not assume a listed feature is generally available", "Re-read dates before a freeze"],
      figure: row("A feature can sit behind a program", [
        { id: "n", label: "Release note", sub: "planned", tone: 2 },
        { id: "p", label: "Public Preview", sub: "was Controlled Release", tone: 3 },
        { id: "l", label: "License", sub: "may apply", tone: 1 },
        { id: "t", label: "Your tenant", sub: "later", tone: 4 },
      ], [{ from: "n", to: "p", label: "opt in" }, { from: "n", to: "l", label: "or buy" }, { from: "p", to: "t", label: "then deploy" }]),
      sections: [
        ["The rename", [
          "The 26.3 release notes say that starting with that release, the NiCE CXone Controlled Release program is known as Public Preview. The change is reflected in the online help, the release notes, and other communications.",
          "The same page says you may have to purchase a license or sign up for a public preview to use some features, and that you may receive features at different times in the cycle.",
        ], ["rel263"]],
        ["Names on the 26.2 page", [
          "The 26.2 notes include a rename table. Examples recorded from that page: Digital Experience (DX) stays associated with Digital Experience, and CXone Mpower for Service Cloud Voice is listed as moving to Unified App for Salesforce Voice. Treat the table as a point-in-time rename list, and open the page before you correct a customer's old name.",
          "Agent application names in current help include Agent Workspace (Agent), Agent Workspace (Embedded), Agent Workspace for Microsoft Teams, and Agent Workspace (Browser Extension). Older documents say MAX. Both appear in current pages, so do not pretend MAX has vanished.",
        ], ["rel262", "autosummary"]],
      ],
      flow: flow("Decide if a feature is yours yet", ["Note", "Preview", "License", "Cluster"], [
        step("Note", "Preview", "Read the badge", "Public Preview is the 26.3 name for Controlled Release.", { old: "Controlled Release" }),
        step("Preview", "License", "Check both gates", "A feature can need a program and a license.", { caveat: "on the page" }),
        step("License", "Cluster", "Wait for your group", "Beta is not your maintenance window.", { delay: "two weeks, then groups" }),
        step("Cluster", "Cluster", "Use the new name in the runbook", "Update 'CR' to Public Preview so the next reader searches the right words.", { doc: "runbook" }),
      ]),
      quiz: [
        ["What is Controlled Release called starting with 26.3?", ["Public Preview", "Bullseye", "Integrated Softphone", "Coming Soon"], 0, "The 26.3 notes announce the rename.", "rel263"],
        ["Does a feature listed in release notes automatically arrive for every tenant on beta day?", ["No. Timing, licenses, and preview programs can all apply.", "Yes.", "Only if the skill acceleration is 1.", "Only for digital."], 0, "The notes say features can arrive at different times and may need a license or preview.", "rel263"],
        ["MAX in current help pages is…", ["Still named, including as a place AutoSummary can run", "Removed in 26.2 with no remaining references", "A carrier", "An RFC"], 0, "The AutoSummary overview lists MAX alongside Agent Workspace.", "autosummary"],
        ["Unified App for Salesforce Voice is a rename from what, on the 26.2 table retrieved for this lab?", ["CXone Mpower for Service Cloud Voice", "Avaya CMS", "RFC 3261", "Personal Connection"], 0, "Confirm on the live 26.2 page before you correct a diagram, because rename tables move.", "rel262"],
        ["Where does a customer cluster sit relative to beta?", ["It starts two weeks later, in groups", "It is the same instant", "It is a year later", "Customers never get release notes"], 0, "That is the release process page.", "releaseProcess"],
        ["Why keep the old name in parentheses once?", ["So a search for Controlled Release still finds Public Preview", "Because the rename was cancelled", "Because legal requires both forever", "No reason"], 0, "The notes say the new name is Public Preview. A single alias helps readers of old tickets.", "rel263"],
      ],
      cards: [
        ["Public Preview", "The 26.3 name for Controlled Release."],
        ["License or preview", "Either can gate a feature listed in notes."],
        ["MAX", "Still named in current help. Not deleted by this lab."],
        ["Rename table", "26.2 published product renames. Re-read before you enforce one."],
      ],
      lab: ["Rewrite one sentence", "Update a fake old ticket.", [
        "Start with: 'Enable this under Controlled Release for MAX only.'",
        "Change Controlled Release to Public Preview and mention the old name once.",
        "Add 'confirm license and whether your cluster has the feature.'",
        "Do not delete MAX unless the current page for that feature has.",
      ], "The sentence matches the 26.3 wording."],
      faults: [
        ["Searching the wrong program", "A feature request is rejected because the portal has no Controlled Release checkbox.", "ticket=join Controlled Release\n26.3=program renamed Public Preview", "The program changed names. The feature may also need a license.", "Search Public Preview and re-read the feature's own help page.", "rel263"],
      ],
    }),
    quick({
      id: "key-versus-password",
      title: "Access keys are not passwords",
      level: "intermediate", minutes: 12,
      summary: "A person logs in with a password or an IdP. A back-end app sends an access key id and secret to the token endpoint. The global token URL comes from OpenID discovery, not from a guess.",
      objectives: ["Call discovery before the token URL", "Map key id and secret onto the password grant", "Plan refresh before expiry"],
      figure: row("Discovery, then token", [
        { id: "i", label: "Issuer", sub: "cxone.niceincontact.com", tone: 1 },
        { id: "d", label: "Discovery", sub: "openid-configuration", tone: 3 },
        { id: "t", label: "Token", sub: "password grant", tone: 2 },
        { id: "a", label: "API", sub: "Bearer", tone: 4 },
      ], [{ from: "i", to: "d", label: "GET" }, { from: "d", to: "t", label: "token_endpoint" }, { from: "t", to: "a", label: "access_token" }]),
      sections: [
        ["The back-end grant", [
          "Getting Started says a back-end app provides an access key id and secret. For client_secret_basic, you send a basic authorization header with the application's client id and secret, and a form body with grant_type password, username set to the access key id, and password set to the secret. client_secret_post puts the client id and secret in the body instead.",
          "You learn the token URL from the discovery document. Global production discovery is https://cxone.niceincontact.com/.well-known/openid-configuration. The sample response on the page includes token_endpoint https://cxone.niceincontact.com/auth/token.",
        ], ["gettingStarted"]],
        ["Refresh, and the five-minute tip", [
          "The page says the token response includes a TTL, and that you should plan to renew before 5 minutes of access token expiry. It also says expires_in may differ from one token to the next. The sample token body shows expires_in 3600. Treat 3600 as that sample, not a contract.",
          "OpenID Connect, for a user-facing app, is a different flow: scope openid, response_type code, then an authorization code at the token endpoint. Do not paste the password grant into a browser login.",
        ], ["gettingStarted", "oidc"]],
      ],
      flow: flow("Back-end token", ["App", "Discovery", "Token", "API"], [
        step("App", "Discovery", "GET openid-configuration", "Use the issuer for the environment.", { global: "https://cxone.niceincontact.com" }),
        step("Discovery", "Token", "POST token_endpoint", "grant_type=password.", { username: "access key id", password: "secret" }),
        step("Token", "App", "Read expires_in", "Renew before the last five minutes.", { sample: "3600 in the docs example" }),
        step("App", "API", "Authorization Bearer", "Then discover api_endpoint with tenantId.", { header: "Bearer" }),
      ]),
      quiz: [
        ["In the password grant, what is the username?", ["The access key id", "The agent's first name", "The tenant name", "The client secret"], 0, "Getting Started maps username to the access key id and password to the secret.", "gettingStarted"],
        ["Where do you read the token URL?", ["token_endpoint in the OpenID discovery document", "Always a hard-coded IP", "The skill's acceleration field", "The SIP trunk"], 0, "Do not skip discovery.", "gettingStarted"],
        ["Global production issuer?", ["https://cxone.niceincontact.com", "https://api-na1.niceincontact.com", "https://help.nicecxone.com", "https://openid.net"], 0, "FedRAMP is https://cxone-gov.niceincontact.com.", "gettingStarted"],
        ["The renewal tip on the page is…", ["Renew before 5 minutes of access-token expiry", "Renew once a year", "Never refresh", "Refresh only after a 401 storm"], 0, "expires_in is not guaranteed to stay at the sample value.", "gettingStarted"],
        ["The sample expires_in on Getting Started is…", ["3600", "90", "5", "20"], 0, "It is a sample. The page says each exchange can differ.", "gettingStarted"],
        ["A user-facing app should use which OpenID values?", ["scope openid and response_type code", "grant_type password in the browser with the agent's password", "No token", "A DNIS"], 0, "Those are the only supported values the page names for that flow.", "gettingStarted"],
      ],
      cards: [
        ["username", "Access key id, on the back-end password grant."],
        ["password", "Access key secret. Not the employee's login password."],
        ["token_endpoint", "Taken from discovery. Sample: /auth/token on the global issuer."],
        ["Five minutes", "Renew before that much life remains."],
      ],
      lab: ["Fill a token card", "Use the sample values only as labels.", [
        "Write the discovery URL for global production.",
        "Write grant_type, username, and password with the field mapping, not with a real secret.",
        "Add expires_in and the five-minute rule.",
        "Add a second card for OIDC that says authorization code, not password.",
      ], "The two cards cannot be swapped by mistake."],
      faults: [
        ["Agent password in the server", "A back-end job stores an agent's password and sends it as the OAuth password.", "grant_type=password username=agent@company password=<login>", "The password field on that grant is the access key secret. The employee for a back-end app has no login authenticator.", "Create an access key on a least-privilege employee and rotate the leaked password.", "gettingStarted"],
      ],
    }),
    quick({
      id: "attributes",
      title: "Employee attributes that turn features on",
      level: "intermediate", minutes: 11,
      summary: "A role is not the only switch. Digital agents need the Digital Engagement attribute. Salesforce screen-pop needs Agent Integrations and Customer Card. Those attributes can also be how you are billed.",
      objectives: ["Find attributes on the employee", "Name Digital Engagement", "Name the two Salesforce attributes"],
      figure: row("Attribute gates", [
        { id: "e", label: "Employee", sub: "profile", tone: 1 },
        { id: "d", label: "Digital Engagement", sub: "digital work", tone: 3 },
        { id: "i", label: "Agent Integrations", sub: "CRM", tone: 2 },
        { id: "c", label: "Customer Card", sub: "card on screen", tone: 4 },
      ], [{ from: "e", to: "d", label: "enable" }, { from: "e", to: "i", label: "enable" }, { from: "e", to: "c", label: "enable" }]),
      sections: [
        ["Digital", [
          "Digital Channels says agents need a supported agent application, permissions for each channel, the Digital Engagement attribute on the employee profile, and assignment to the digital skills or routing queues for that channel. MAX supports the digital channels the page discusses. Agent Workspace support depends on the application, and the page tells you to check that application's details.",
          "A skill assignment without the attribute is not the whole setup. The page lists both.",
        ], ["digitalChannels"]],
        ["Salesforce", [
          "The Salesforce Agent Workspace page says to enable Customer Card so agents can see the customer card, and Agent Integrations so they can open Agent Workspace for Salesforce and see Salesforce records in the card. Billing follows the count of employees with Agent Integrations enabled.",
          "The Salesforce org must be Lightning, and it must use console navigation. Standard navigation opens each record in a new browser tab.",
        ], ["sfAgent"]],
      ],
      flow: flow("Turn on digital for one agent", ["Admin", "Employee", "Skill", "Channel"], [
        step("Admin", "Employee", "Open the profile", "Attributes are on the employee, not on the script.", { app: "Admin" }),
        step("Employee", "Employee", "Digital Engagement", "Required for digital channels.", { attribute: "on" }),
        step("Employee", "Skill", "Assign the digital skill", "The channel's default skill or the script's target.", { permission: "channel permission too" }),
        step("Skill", "Channel", "Test one contact", "MAX, or an Agent Workspace app you have checked.", { app: "confirm support" }),
      ]),
      quiz: [
        ["Which attribute does the digital channels page require?", ["Digital Engagement", "Customer Card only", "AW-HDS-DDS", "Public Preview"], 0, "It is on the employee profile, along with channel permissions and the skill.", "digitalChannels"],
        ["Which attribute drives CRM integration billing on the Salesforce page?", ["Agent Integrations", "Digital Engagement", "The campaign", "Acceleration"], 0, "Billing is based on employees with that attribute enabled.", "sfAgent"],
        ["Customer Card is enabled so that…", ["Agents can see the customer card", "The carrier can route", "WFM can forecast", "SIP can register"], 0, "The Salesforce page says to enable it under Admin > Employees.", "sfAgent"],
        ["Salesforce navigation must be…", ["Console navigation in Lightning", "Standard navigation", "Classic only", "Irrelevant"], 0, "Standard navigation opens each interaction's record in a new browser tab.", "sfAgent"],
        ["Does MAX support digital channels, according to the digital channels page?", ["Yes. The page says MAX supports all available digital channels.", "No. MAX is voice only.", "Only email", "Only if acceleration is 0"], 0, "Agent Workspace support depends on which application you use.", "digitalChannels"],
        ["A digital skill assignment replaces the need for the attribute.", ["False", "True", "Only for outbound", "Only in FedRAMP"], 0, "The page lists the attribute and the skill as separate requirements.", "digitalChannels"],
      ],
      cards: [
        ["Digital Engagement", "Employee attribute required for digital channels."],
        ["Agent Integrations", "Salesforce access, and the billing counter."],
        ["Customer Card", "Lets the agent see the customer card."],
        ["Console navigation", "Required so Salesforce records do not open as new browser tabs."],
      ],
      lab: ["Audit one fake profile", "Find the missing attribute.", [
        "Write an employee who has the chat digital skill and no attributes.",
        "Add Digital Engagement and the channel permission.",
        "On a second profile, add Agent Integrations and Customer Card, and write 'Lightning console' beside the org.",
        "Note the billing consequence of the second attribute only.",
      ], "Each profile has the attributes its channel needs and no extras you cannot explain."],
      faults: [
        ["Chat skill, no attribute", "Agents are staffed on Chat_Digital and never offered a chat.", "skill=Chat_Digital assigned=yes\nattribute Digital Engagement=off", "The digital channels page requires the attribute, the permission, and the skill.", "Enable Digital Engagement on the employee profile and confirm the role has the channel permission.", "digitalChannels"],
      ],
    }),
  ]),
];
