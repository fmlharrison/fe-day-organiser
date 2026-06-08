import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import { CrtOverlay } from "@/components/layout/CrtOverlay";
import "@/styles/retro.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FE Day 2026",
  description: "Submit your talk idea for Cleo's Front-End chapter mini-conference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} ${vt323.variable}`}>
        <div className="app-root">
          {children}
          <CrtOverlay />
        </div>
      </body>
    </html>
  );
}
