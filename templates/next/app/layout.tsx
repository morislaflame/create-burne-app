import type { Metadata } from "next";

import { BurneProviders } from "@/components/providers/burne-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Burne UI App",
  description: "Starter app with Burne UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-background text-foreground antialiased">
        <BurneProviders>{children}</BurneProviders>
      </body>
    </html>
  );
}
