import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

/** @typedef {"npm" | "pnpm" | "bun" | "yarn"} PackageManager */
/** @typedef {"next" | "vite"} TemplateId */

/**
 * Detect package manager from how the CLI was invoked.
 * `npx` / `npm create` → npm, `pnpm dlx` / `pnpm create` → pnpm, `bunx` / `bun create` → bun.
 * @returns {PackageManager}
 */
export function detectPackageManager() {
  const ua = process.env.npm_config_user_agent ?? "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("bun")) return "bun";

  const execpath = process.env.npm_execpath ?? "";
  if (execpath.includes("pnpm")) return "pnpm";
  if (execpath.includes("yarn")) return "yarn";
  if (execpath.includes("bun")) return "bun";

  return "npm";
}

/**
 * @param {PackageManager} pm
 * @returns {{ install: string[]; runDev: string; createHint: string }}
 */
export function packageManagerCommands(pm) {
  switch (pm) {
    case "pnpm":
      return {
        install: ["install"],
        runDev: "pnpm dev",
        createHint: "pnpm create burne-app",
      };
    case "bun":
      return {
        install: ["install"],
        runDev: "bun run dev",
        createHint: "bunx create-burne-app",
      };
    case "yarn":
      return {
        install: ["install"],
        runDev: "yarn dev",
        createHint: "yarn create burne-app",
      };
    default:
      return {
        install: ["install"],
        runDev: "npm run dev",
        createHint: "npm create burne-app@latest",
      };
  }
}

/**
 * @param {string} pmBin
 * @param {string[]} args
 * @param {string} cwd
 */
function runCommand(pmBin, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(pmBin, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${pmBin} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

/**
 * @param {string} src
 * @param {string} dest
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

/**
 * @param {string[]} argv
 * @returns {{
 *   name?: string;
 *   template?: TemplateId;
 *   pm?: PackageManager;
 *   yes: boolean;
 *   skipInstall: boolean;
 *   help: boolean;
 *   version: boolean;
 * }}
 */
function parseArgs(argv) {
  /** @type {ReturnType<typeof parseArgs>} */
  const out = {
    yes: false,
    skipInstall: false,
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--version" || arg === "-v") out.version = true;
    else if (arg === "--yes" || arg === "-y") out.yes = true;
    else if (arg === "--skip-install") out.skipInstall = true;
    else if (arg === "--template" || arg === "-t") {
      const v = argv[++i];
      if (v === "next" || v === "vite") out.template = v;
      else throw new Error(`Unknown template "${v}". Use next or vite.`);
    } else if (arg === "--pm") {
      const v = argv[++i];
      if (v === "npm" || v === "pnpm" || v === "bun" || v === "yarn") out.pm = v;
      else throw new Error(`Unknown package manager "${v}". Use npm, pnpm, bun, or yarn.`);
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (!out.name) {
      out.name = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  return out;
}

function printHelp(cliVersion) {
  console.log(`
create-burne-app  v${cliVersion}

Scaffold a Next.js or Vite app with Burne UI (BurneUIProvider, Tailwind v4, demo page).

Usage:
  npm create burne-app@latest [name] [options]
  pnpm create burne-app [name] [options]
  bunx create-burne-app [name] [options]
  yarn create burne-app [name] [options]
  npx create-burne-app [name] [options]

Options:
  --template, -t   next | vite          (default: next)
  --pm             npm | pnpm | bun | yarn
                   (default: detected from how you ran the CLI)
  --yes, -y        skip prompts, use defaults
  --skip-install   do not run install
  --help, -h
  --version, -v

Examples:
  npm create burne-app@latest my-app
  pnpm create burne-app my-app --template vite
  bunx create-burne-app my-app --pm bun -y
`);
}

/**
 * @param {string[]} argv
 * @param {string} cliVersion
 */
export async function run(argv, cliVersion) {
  const args = parseArgs(argv);

  if (args.help) {
    printHelp(cliVersion);
    return;
  }
  if (args.version) {
    console.log(cliVersion);
    return;
  }

  const rl =
    args.yes || (args.name && args.template)
      ? null
      : readline.createInterface({ input, output });

  try {
    let name = args.name;
    if (!name) {
      if (args.yes) name = "burne-app";
      else {
        const answer = await rl.question("Project name (burne-app): ");
        name = (answer.trim() || "burne-app").replace(/[\\/]/g, "-");
      }
    }

    /** @type {TemplateId} */
    let template = args.template ?? "next";
    if (!args.template && !args.yes && rl) {
      const answer = await rl.question("Template — next / vite (next): ");
      const t = answer.trim().toLowerCase();
      if (t === "vite" || t === "next") template = t;
      else if (t) throw new Error(`Unknown template "${t}". Use next or vite.`);
    }

    /** @type {PackageManager} */
    let pm = args.pm ?? detectPackageManager();
    if (!args.pm && !args.yes && rl) {
      const answer = await rl.question(
        `Package manager — npm / pnpm / bun / yarn (${pm}): `,
      );
      const p = answer.trim().toLowerCase();
      if (p === "npm" || p === "pnpm" || p === "bun" || p === "yarn") pm = p;
      else if (p) throw new Error(`Unknown package manager "${p}".`);
    }

    const target = path.resolve(process.cwd(), name);
    if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
      throw new Error(`Directory "${name}" already exists and is not empty.`);
    }

    const templateDir = path.join(TEMPLATES_DIR, template);
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template "${template}" not found at ${templateDir}`);
    }

    const packageName = path.basename(target).replace(/[^a-zA-Z0-9._-]+/g, "-");

    console.log(`\nScaffolding ${template} app → ${target}\n`);
    copyDir(templateDir, target);

    const pkgPath = path.join(target, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = packageName;
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

    const cmds = packageManagerCommands(pm);

    if (!args.skipInstall) {
      console.log(`Installing with ${pm}…\n`);
      await runCommand(pm, cmds.install, target);
    } else {
      console.log("Skipped install (--skip-install).\n");
    }

    console.log(`Done.

  cd ${path.relative(process.cwd(), target) || "."}
  ${args.skipInstall ? `${pm} install\n  ` : ""}${cmds.runDev}

Optional: customize theme on the Burne UI site → Copy config / Copy CSS.
`);
  } finally {
    rl?.close();
  }
}
