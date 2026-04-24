"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function safePrefsRedirect(raw: FormDataEntryValue | null): "/dashboard" | "/" {
  const v = typeof raw === "string" ? raw.trim() : "";
  return v === "/" ? "/" : "/dashboard";
}

export async function updateNotificationPreferences(formData: FormData): Promise<void> {
  const user = await requireUser();
  const supabase = createClient();
  const next = safePrefsRedirect(formData.get("next"));

  const notifyEmail = formData.get("notifyEmail") === "on";
  const notifySms = formData.get("notifySms") === "on";
  const notifyPush = formData.get("notifyPush") === "on";

  const { error } = await supabase
    .from("profiles")
    .update({
      notify_email: notifyEmail,
      notify_sms: notifySms,
      notify_push: notifyPush,
    })
    .eq("id", user.id);

  if (error) {
    redirect(`${next}?prefs=error`);
  }
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect(`${next}?prefs=saved`);
}
