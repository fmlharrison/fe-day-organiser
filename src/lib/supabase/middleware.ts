import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isCleoEmail } from "@/lib/auth";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/agenda") || pathname.startsWith("/pitch");
  const isApi = pathname.startsWith("/api/");

  if (user && !isCleoEmail(user.email)) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "domain");
    return NextResponse.redirect(url);
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "session");
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/" && !request.nextUrl.searchParams.has("error")) {
    const url = request.nextUrl.clone();
    url.pathname = "/agenda";
    return NextResponse.redirect(url);
  }

  if (isApi && !user && pathname.startsWith("/api/submissions")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return supabaseResponse;
}
