/* Development-set score. The frozen held-out file is tests/cxbot-heldout.json. */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const result = spawnSync(process.execPath, [
  join(here, "cxbot-heldout.mjs"),
  "--spec", join(here, "cxbot-dev.json"),
  "--out", join(here, "cxbot-dev-report.json"),
], { stdio: "inherit" });
process.exit(result.status || 0);
