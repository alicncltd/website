"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { TranslationProvider } from "../components/TranslationContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TranslationProvider>
        {children}
      </TranslationProvider>
    </ThemeProvider>
  );
}

