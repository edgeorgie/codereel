import { execSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyCsp, posthogOrigins } from "./csp.mjs";

// Builds a static export and publishes it to the gh-pages branch of the origin remote.
const { name } = JSON.parse(readFileSync("package.json", "utf8"));
const run = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });

// The export cannot proxy /ingest, so a key without a direct host would send events to a 404 and silently lose them.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY && !process.env.NEXT_PUBLIC_POSTHOG_HOST) {
  console.error("NEXT_PUBLIC_POSTHOG_KEY is set but the static export has no proxy: set NEXT_PUBLIC_POSTHOG_HOST (for example https://us.i.posthog.com) or unset the key.");
  process.exit(1);
}

run("npm run build", { env: { ...process.env, DEPLOY_TARGET: "pages", PAGES_BASE_PATH: `/${name}` } });

const posthog = posthogOrigins(process.env.NEXT_PUBLIC_POSTHOG_HOST);
applyCsp(
  "out",
  ["https://api.anthropic.com", "https://api.openai.com", "https://api.github.com", "https://raw.githubusercontent.com", ...posthog.connect],
  posthog.script,
);

const remote = execSync("git remote get-url origin").toString().trim();
const dir = mkdtempSync(join(tmpdir(), "pages-"));
cpSync("out", dir, { recursive: true });
writeFileSync(join(dir, ".nojekyll"), "");
const git = (cmd) => run(`git ${cmd}`, { cwd: dir });
git("init -q -b gh-pages");
git("add -A");
git('commit -q -m "Deploy static export"');
git(`push -q -f ${remote} gh-pages`);
console.log(`Published ${name} to gh-pages. Pages URL: https://edgeorgie.github.io/${name}/`);
