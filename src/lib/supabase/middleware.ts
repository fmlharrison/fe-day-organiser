import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedEmail } from "@/lib/auth/domain";

const PROTECTED_PATHS = ["/agenda", "/pitch", "/my-pitches", "/admin"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run any logic between creating the client and getUser(): the
  // session refresh must happen first so refreshed cookies land on the
  // response before any redirect is built.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedPath(request.nextUrl.pathname)) {
    if (!user) {
      return redirectWithSession(request, "/", response);
    }
    if (!isAllowedEmail(user.email)) {
      await supabase.auth.signOut();
      return redirectWithSession(request, "/?error=domain", response);
    }
  }

  return response;
}

function redirectWithSession(
  request: NextRequest,
  to: string,
  source: NextResponse,
): NextResponse {
  const url = new URL(to, request.url);
  const redirectResponse = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}
