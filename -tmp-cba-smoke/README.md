# Burne UI + Vite

## Scripts

Works with **npm**, **pnpm**, and **bun**:

```bash
npm install && npm run dev
# or
pnpm install && pnpm dev
# or
bun install && bun run dev
```

## Customize theme

1. Open the Burne UI docs site theme builder
2. **Copy config** → save as `src/burne-theme.ts` and pass to `BurneUIProvider`
3. Or **Copy CSS** → `src/burne-theme.css` and uncomment the import in `src/index.css`
