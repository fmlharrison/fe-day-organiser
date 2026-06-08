"use client";

import { useState } from "react";
import { LandingTitleScreen } from "@/components/landing/LandingTitleScreen";
import { createClient } from "@/lib/supabase/client";

type LandingClientProps = {
  authError?: string | null;
};

export function LandingClient({ authError: initialError }: LandingClientProps) {
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState(initialError ?? null);

  const handleSignIn = async () => {
    setSigningIn(true);
    setAuthError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: "meetcleo.com",
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      setSigningIn(false);
    }
  };

  return (
    <LandingTitleScreen
      onSignIn={handleSignIn}
      signingIn={signingIn}
      authError={authError}
    />
  );
}
