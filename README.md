# create-burne-app

Scaffold a **Next.js** or **Vite** app with [Burne UI](https://www.npmjs.com/package/burne-ui): styles, `BurneUIProvider`, Tailwind CSS v4, demo page.

## Usage (npm / pnpm / bun / yarn)

```bash
# npm
npm create burne-app@latest my-app
npx create-burne-app@latest my-app

# pnpm
pnpm create burne-app my-app
pnpm dlx create-burne-app my-app

# bun
bunx create-burne-app my-app
bun create burne-app my-app

# yarn
yarn create burne-app my-app
```

Package manager for **install inside the new project** is detected from how you invoked the CLI (`npm_config_user_agent`), or set explicitly:

```bash
npx create-burne-app my-app --pm pnpm
bunx create-burne-app my-app --pm bun --template vite -y
```

### Options

| Flag | Description |
|------|-------------|
| `--template`, `-t` | `next` (default) or `vite` |
| `--pm` | `npm` \| `pnpm` \| `bun` \| `yarn` |
| `--yes`, `-y` | skip prompts |
| `--skip-install` | only copy files |

## Local development (this repo)

```bash
cd create-burne-app
node bin/create-burne-app.js /tmp/test-burne --template next --pm npm -y
```

Templates live in `templates/next` and `templates/vite`.

## After scaffold

```bash
cd my-app
npm run dev   # or pnpm dev / bun run dev
```

Customize theme: Burne UI site → **Copy config** / **Copy CSS**.

## Publish checklist

1. Publish **`burne-ui@1.4.0+`** (templates depend on `BurneUIProvider`).
2. Set `repository.url` in this `package.json` to your GitHub repo.
3. From `create-burne-app/`: `npm publish` (or `pnpm publish` / `bun publish`).
4. Users run `npm create burne-app@latest` — templates ship **inside the npm package**, no separate clone required.

Optional: also push this folder (or the whole monorepo) to GitHub for source control — not required for `npx` to work.
