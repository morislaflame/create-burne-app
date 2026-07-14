"use client";

import { Alert, Button, Card, Input, Switch, Text, useBurneTheme } from "burne-ui";
import { IoMoon, IoSunny } from "react-icons/io5";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useBurneTheme();

  return (
    <Switch
      gloss
      checked={resolvedTheme === "light"}
      onChange={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      iconOff={<IoMoon aria-hidden />}
      iconOn={<IoSunny aria-hidden />}
      label="Theme"
    />
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center gap-mid p-large">
      <div className="flex items-center justify-between gap-mid">
        <Text as="h1" variant="header-1">
          Burne UI
        </Text>
        <ThemeToggle />
      </div>
      <Text variant="base" className="text-muted">
        Next.js starter with BurneUIProvider, Tailwind v4, and theme support.
      </Text>
      <Card className="p-mid">
        <div className="flex flex-col gap-base">
          <Button variant="primary">Primary</Button>
          <Button variant="gloss">Gloss</Button>
          <Input placeholder="Enter your name" />
        </div>
      </Card>
      <Alert className="w-full max-w-none">
        On the docs site: tune tokens → Copy config → save as burne-theme.ts and pass to
        BurneUIProvider. Or Copy CSS into app/burne-theme.css.
      </Alert>
    </main>
  );
}
