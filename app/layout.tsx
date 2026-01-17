import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import { LanguageProvider } from "@/components/LanguageProvider";
// import LockProvider from "@/components/providers/LockProvider";
import Providers from "@/components/Providers";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Accault",
  description: "Remember One, Access All",
};

type Props = Readonly<{ children: React.ReactNode }>;

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        <LanguageProvider>
          <Providers>
            {/* <LockProvider> */}
              <Navbar />
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  className:
                    "!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white border border-gray-200 dark:border-gray-700 shadow-lg",
                }}
              />
              <main>{children}</main>
              <div className="bg-gray-200 dark:bg-gray-800 w-full h-1"></div>
              <Footer />
            {/* </LockProvider> */}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
