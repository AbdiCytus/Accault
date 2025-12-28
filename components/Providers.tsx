"use client";

import { SessionProvider as Session } from "next-auth/react";
import { ThemeProvider } from "next-themes";
type Provider = { children: React.ReactNode };

const Providers = ({ children }: Provider) => {
  return (
    <Session>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
    </Session>
  );
};
export default Providers;
