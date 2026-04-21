/**
 * Supabase Edge Function — schedule-friendly (invoke via cron / pg_net).
 *
 * Intended behavior:
 *  - Find upcoming `public.events` and enqueue `notification_outbox` rows for 24h + 1h reminders.
 *  - Respect `public.event_reminders_sent` for deduplication.
 *
 * Integrations (stubs):
 *  - After inserting outbox rows, call `process-notification-outbox` or inline-send via Resend/Twilio/Web Push.
 *  - Keep secrets in Supabase Dashboard → Edge Functions → Secrets (RESEND_API_KEY, TWILIO_*, VAPID_PRIVATE_KEY).
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => {
  console.log(
    "[dispatch-event-reminders] Stub — implement SQL time windows + per-user fan-out here. See schema.sql comments.",
  );
  return new Response(JSON.stringify({ ok: true, stub: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
