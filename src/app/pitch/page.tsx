import { TopBar } from "@/components/agenda/TopBar";
import { PitchForm } from "@/components/pitch/PitchForm";
import { signOut } from "@/app/auth/actions";
import { submitTalk } from "@/app/pitch/actions";
import { requireUser } from "@/lib/auth/user";
import { isOrganiser } from "@/lib/submissions";

type PitchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PitchPage({ searchParams }: PitchPageProps) {
  const user = await requireUser();
  const organiser = await isOrganiser();
  const t = (await searchParams).type;
  const presetType = typeof t === "string" ? t : undefined;

  return (
    <div>
      <TopBar user={user} isOrganiser={organiser} signOutAction={signOut} />
      <div className="wrap" style={{ maxWidth: 760 }}>
        <PitchForm userName={user.name} presetType={presetType} submitAction={submitTalk} />
      </div>
    </div>
  );
}
