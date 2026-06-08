import { LandingClient } from "@/components/landing/LandingClient";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const authError = params.error
    ? AUTH_ERROR_MESSAGES[params.error] ?? null
    : null;

  return <LandingClient authError={authError} />;
}
