import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";

/**
 * Supabase Auth (PKCE / magic link) callback with cookie getAll/setAll on the redirect response.
 * Dashboard → Authentication → URL Configuration → add `${NEXT_PUBLIC_SITE_URL}/auth/callback`
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = url.searchParams.get("next") ?? "/dashboard?welcome=1";
  const redirectUrl = new URL(nextPath, url.origin);

  let response = NextResponse.redirect(redirectUrl);

  if (!code) {
    return NextResponse.redirect(new URL("/register?error=auth", url.origin));
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.redirect(redirectUrl);
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/register?error=auth", url.origin));
  }

  return response;
}
