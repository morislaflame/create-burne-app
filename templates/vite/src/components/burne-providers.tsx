import { BurneUIProvider } from "burne-ui";
import type { ReactNode } from "react";

/**
 * App-level Burne UI setup: theme (system/light/dark), Toast, motion defaults.
 *
 * Optional: import config from the site (Copy config) → `config={burneTheme}`.
 */
export function BurneProviders({ children }: { children: ReactNode }) {
  return (
    <BurneUIProvider defaultTheme="system" toast>
      {children}
    </BurneUIProvider>
  );
}
