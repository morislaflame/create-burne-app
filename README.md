# create-burne-app

Scaffold a **Next.js** or **Vite** app with [Burne UI](https://www.npmjs.com/package/burne-ui).

## Usage

```bash
npm create burne-app@latest
pnpm create burne-app
bunx create-burne-app
```

Интерактивно: **стрелки** ↑↓, **Enter** — выбор framework и package manager.

С флагами (без меню):

```bash
npx create-burne-app my-app --template vite --pm bun -y
```

| Flag | Description |
|------|-------------|
| `--template`, `-t` | `next` \| `vite` |
| `--pm` | `npm` \| `pnpm` \| `bun` \| `yarn` |
| `--yes`, `-y` | без промптов |
| `--skip-install` | только файлы |

## Как обновить стартовый экран (templates)

Шаблоны: `templates/next`, `templates/vite`.

1. Правишь файлы (например `templates/next/app/page.tsx`).
2. Бампишь `version` в `package.json` (`1.1.0` → `1.1.1`).
3. Публикуешь:

```bash
cd create-burne-app
npm publish --access public
```

4. Пользователи:

```bash
npm create burne-app@latest
```

Подробнее: [`../PUBLISHING.md`](../PUBLISHING.md).

## Local dev

```bash
cd create-burne-app
npm install
node bin/create-burne-app.js
```
