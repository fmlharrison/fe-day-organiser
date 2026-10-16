import { redirectToCurrentEvent } from "@/lib/legacy-routes";

type LegacyPitchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LegacyPitchPage({ searchParams }: LegacyPitchPageProps) {
  const type = (await searchParams).type;
  await redirectToCurrentEvent(
    "pitch",
    typeof type === "string" ? `?type=${encodeURIComponent(type)}` : "",
  );
}
