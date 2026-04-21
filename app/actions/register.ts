"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

import { registerSchema } from "./schemas";

export type RegisterState = { ok: boolean; message?: string } | null;

/**
 * Join-the-family flow: magic link (email) and/or SMS OTP (phone) via Supabase Auth.
 * Preferences are stored on auth.users.raw_user_meta_data and copied to public.profiles by DB trigger.
 *
 * Twilio: enable Phone provider in Supabase + set Twilio credentials (Dashboard).
 * Welcome email: wire Auth Hook or Database Webhook → Edge Function (see supabase/functions/send-welcome-email).
 */
export async function registerWithSupabase(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notifyEmail: formData.get("notifyEmail") === "on",
    notifySms: formData.get("notifySms") === "on",
    notifyPush: formData.get("notifyPush") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  const { fullName, email, phone, notifyEmail, notifySms, notifyPush } = parsed.data;
  if (!email && !phone) {
    return {
      ok: false,
      message: "Please share an email or phone number so we can stay in touch.",
    };
  }

  const supabase = await createClient();
  const origin = getSiteUrl();
  const userMeta = {
    full_name: fullName ?? "",
    phone: phone ?? "",
    notify_email: notifyEmail,
    notify_sms: notifySms,
    notify_push: notifyPush,
  };

  if (email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard?welcome=1`,
        data: userMeta,
      },
    });
    if (error) {
      return { ok: false, message: error.message };
    }
  }

  if (phone) {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true,
        channel: "sms",
        data: userMeta,
      },
    });
    if (error) {
      return { ok: false, message: error.message };
    }
  }

  if (phone && !email) {
    redirect("/auth/verify-phone");
  }

  if (email && phone) {
    redirect("/register?pending=both");
  }

  redirect("/register?pending=email");
}
