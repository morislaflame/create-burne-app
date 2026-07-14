import { Alert, Button, Card, Text, useBurneTheme } from "burne-ui";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useBurneTheme();
  const next = resolvedTheme === "light" ? "dark" : "light";

  return (
    <Button type="button" size="small" variant="outline" onClick={() => setTheme(next)}>
      Theme: {resolvedTheme}
    </Button>
  );
}

export default function App() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center gap-mid p-large">
      <div className="flex items-start justify-between gap-mid">
        <Text as="h1" variant="header-1">
          Burne UI
        </Text>
        <ThemeToggle />
      </div>
      <Text variant="base" className="text-muted">
        Vite starter with BurneUIProvider, Tailwind v4, and theme support.
      </Text>
      <Card className="p-mid">
        <div className="flex flex-col gap-small">
          <Button variant="primary">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="gloss">Gloss</Button>
        </div>
      </Card>
      <Alert status="info" title="Customize theme">
        On the docs site: tune tokens → Copy config → save as burne-theme.ts and pass to
        BurneUIProvider. Or Copy CSS into src/burne-theme.css.
      </Alert>
    </main>
  );
}
