import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBarWrapper from "./components/TopBarWrapper";
import { AppProviders } from "@/providers/AppProviders";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VERBA AI — PSLang Judge",
  description: "Voice → PSLang → AI Judge → Simulated Wallet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          <TopBarWrapper />
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </AppProviders>
      </body>
    </html>
  );
}
