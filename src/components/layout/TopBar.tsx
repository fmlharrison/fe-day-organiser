"use client";

import Link from "next/link";
import { Btn } from "@/components/ui/Btn";
import type { AppUser } from "@/types";

type TopBarProps = {
  user: AppUser;
  onSignOut: () => void;
  right?: React.ReactNode;
};

export function TopBar({ user, onSignOut, right }: TopBarProps) {
  const initials = (user.name || "FE")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="topbar">
      <Link href="/agenda" className="brand">
        FE DAY &rsquo;26
      </Link>
      <div className="row" style={{ gap: 14 }}>
        {right}
        <div className="row" style={{ gap: 10 }}>
          <div className="avatar" title={user.email}>
            {initials}
          </div>
          <Btn variant="ghost sm" onClick={onSignOut}>
            EXIT
          </Btn>
        </div>
      </div>
    </div>
  );
}
