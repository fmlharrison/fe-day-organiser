import type { Metadata } from "next";
import { eventDocumentTitle } from "@/lib/events";
import { getEventBySlug } from "@/lib/events.server";

type EventLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EventLayoutProps): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  return event ? { title: eventDocumentTitle(event) } : {};
}

export default function EventLayout({ children }: EventLayoutProps) {
  return children;
}
