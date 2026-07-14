"use client";

import { BurneUIProvider } from "burne-ui";

/**
 * App-level Burne UI setup: theme (system/light/dark), Toast, motion defaults.
 *
 * Optional: import a config from the site theme builder (Copy config)
 * and pass `config={burneTheme}`.
 *
 * @example
 * import burneTheme from "@/burne-theme";
 * <BurneUIProvider config={burneTheme}>{children}</BurneUIProvider>
 */
export function BurneProviders({ children }: { children: React.ReactNode }) {
  return (
    <BurneUIProvider defaultTheme="system" toast>
      {children}
    </BurneUIProvider>
  );
}
