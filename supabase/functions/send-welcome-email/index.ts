/**
 * Optional Auth Hook / Database Webhook target — send a welcome note after first sign-in.
 *
 * Wire-up:
 *  - Supabase Dashboard → Authentication → Hooks (or Database Webhooks on `auth.users` / `profiles`)
 *  - Point to this function URL with service authorization.
 *
 * Resend example (comment only):
 *   await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${RESEND_API_KEY}` }, ... })
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => {
  console.log("[send-welcome-email] Stub — connect Resend + template when ready.");
  return new Response(JSON.stringify({ ok: true, stub: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
