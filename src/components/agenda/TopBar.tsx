import Link from "next/link";
import { Btn } from "@/components/ui/Btn";
import type { SessionUser } from "@/lib/auth/user";

type TopBarProps = {
  user: SessionUser;
  isOrganiser?: boolean;
  signOutAction: () => void | Promise<void>;
};

function deriveInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0])
    .join("")
    .toUpperCase();
}

export function TopBar({ user, isOrganiser, signOutAction }: TopBarProps) {
  const initials = deriveInitials(user.name);

  return (
    <div className="topbar">
      <Link href="/agenda" className="brand">
        FE DAY ’26
      </Link>
      <div className="row" style={{ gap: 14 }}>
        <Link href="/agenda" className="btn ghost sm">
          AGENDA
        </Link>
        <Link href="/attendees" className="btn ghost sm">
          WHO&apos;S IN
        </Link>
        <Link href="/my-pitches" className="btn ghost sm">
          MY PITCHES
        </Link>
        {isOrganiser && (
          <Link href="/admin" className="btn ghost sm">
            ADMIN
          </Link>
        )}
        <div className="avatar" title={user.email}>
          {initials}
        </div>
        <form action={signOutAction}>
          <Btn variant="ghost sm" type="submit">
            EXIT
          </Btn>
        </form>
      </div>
    </div>
  );
}
