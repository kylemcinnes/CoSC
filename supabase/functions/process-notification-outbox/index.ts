/**
 * Supabase Edge Function — claims rows from `public.notification_outbox` where `processed_at IS NULL`
 * and sends email / SMS / web push.
 *
 * Resend (email):
 *   import { Resend } from 'npm:resend'
 *   const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
 *
 * Twilio (SMS):
 *   // Use Twilio REST API or official helper; read TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN from secrets.
 *
 * Web Push:
 *   // Use `web-push` npm in Deno with VAPID keys; load subscriptions from `push_subscriptions`.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => {
  console.log("[process-notification-outbox] Stub — log-only until Resend/Twilio/web-push are wired.");
  return new Response(JSON.stringify({ ok: true, stub: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
