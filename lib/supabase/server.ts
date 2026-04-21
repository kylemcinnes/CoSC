// These env vars must also be set in the Cloudflare Worker Settings → Environment Variables.

import { createServerClient } from '@supabase/ssr'
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers'

import type { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies() as unknown as UnsafeUnwrappedCookies

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Cloudflare Workers edge runtime limitation - ignore setAll from Server Components
          }
        },
      },
    }
  )
}
