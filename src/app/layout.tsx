import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { eventDocumentTitle } from "@/lib/events";
import { getCurrentEvent } from "@/lib/events.server";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export async function generateMetadata(): Promise<Metadata> {
  const event = await getCurrentEvent();
  return {
    title: event ? eventDocumentTitle(event) : "FE Day · Pitch a Talk",
    description:
      "Cleo's Front-End chapter day. View the agenda and pitch a lightning talk or long talk.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart2P.variable} ${vt323.variable}`}>
      <body>
        {children}
        <div className="crt-overlay" aria-hidden />
      </body>
    </html>
  );
}
