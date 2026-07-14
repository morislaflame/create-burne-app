import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as prompts from "./prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

/** @typedef {"npm" | "pnpm" | "bun" | "yarn"} PackageManager */
/** @typedef {"next" | "vite"} TemplateId */

/**
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
 */
export function packageManagerCommands(pm) {
  switch (pm) {
    case "pnpm":
      return { install: ["install"], runDev: "pnpm dev" };
    case "bun":
      return { install: ["install"], runDev: "bun run dev" };
    case "yarn":
      return { install: ["install"], runDev: "yarn dev" };
    default:
      return { install: ["install"], runDev: "npm run dev" };
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
 */
function parseArgs(argv) {
  /** @type {{
   *   name?: string;
   *   template?: TemplateId;
   *   pm?: PackageManager;
   *   yes: boolean;
   *   skipInstall: boolean;
   *   help: boolean;
   *   version: boolean;
   * }} */
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
      else throw new Error(`Unknown package manager "${v}".`);
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

Scaffold Next.js or Vite + Burne UI.

  npm create burne-app@latest
  pnpm create burne-app
  bunx create-burne-app

Interactive: ↑↓ arrows, Enter to confirm.

Options:
  --template, -t   next | vite
  --pm             npm | pnpm | bun | yarn
  --yes, -y
  --skip-install
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

  const interactive = !args.yes && process.stdin.isTTY;
  const detectedPm = detectPackageManager();

  console.log(`\ncreate-burne-app  v${cliVersion}\n`);

  /** @type {string} */
  let name;
  if (args.name) {
    name = args.name;
  } else if (!interactive) {
    name = "burne-app";
  } else {
    name = await prompts.text({
      message: "Project name",
      placeholder: "burne-app",
      defaultValue: "burne-app",
    });
  }

  /** @type {TemplateId} */
  let template;
  if (args.template) {
    template = args.template;
  } else if (!interactive) {
    template = "next";
  } else {
    template = await prompts.select({
      message: "Framework",
      options: [
        { value: "next", label: "Next.js", hint: "App Router" },
        { value: "vite", label: "Vite", hint: "SPA" },
      ],
    });
  }

  /** @type {PackageManager} */
  let pm;
  if (args.pm) {
    pm = args.pm;
  } else if (!interactive) {
    pm = detectedPm;
  } else {
    pm = await prompts.select({
      message: "Package manager",
      initialValue: detectedPm,
      options: [
        { value: "npm", label: "npm" },
        { value: "pnpm", label: "pnpm" },
        { value: "bun", label: "bun" },
        { value: "yarn", label: "yarn" },
      ],
    });
  }

  const target = path.resolve(process.cwd(), name.trim());
  const displayName = path.basename(target);
  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    throw new Error(`Directory "${displayName}" already exists and is not empty.`);
  }

  const templateDir = path.join(TEMPLATES_DIR, template);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template "${template}" not found`);
  }

  const packageName = displayName.replace(/[^a-zA-Z0-9._-]+/g, "-") || "burne-app";
  console.log(`\nScaffolding ${template} → ${displayName}…`);
  copyDir(templateDir, target);

  const pkgPath = path.join(target, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.name = packageName;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const cmds = packageManagerCommands(pm);

  if (!args.skipInstall) {
    console.log(`\nInstalling with ${pm}…\n`);
    await runCommand(pm, cmds.install, target);
  }

  const rel = path.relative(process.cwd(), target) || ".";
  console.log(`
Done.

  cd ${rel}
  ${args.skipInstall ? `${pm} install\n  ` : ""}${cmds.runDev}

Theme: docs site → Copy config / Copy CSS
`);
}
