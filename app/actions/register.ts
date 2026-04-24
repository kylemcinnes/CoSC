"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

import { registerSignUpSchema } from "./schemas";

export type RegisterState = { ok: boolean; message?: string } | null;

/**
 * Email sign-up via Supabase Auth `signUp`. Profile row is created by DB trigger; we pass
 * `notify_*` defaults in user metadata (all true). Phone + name applied when session exists
 * or via trigger metadata on first insert.
 */
export async function registerFamily(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSignUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.password?.[0] ?? "Please check the form and try again.";
    return { ok: false, message: msg };
  }

  const { fullName, email, phone, password } = parsed.data;
  const supabase = createClient();
  const origin = getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/?joined=1`,
      data: {
        full_name: fullName ?? "",
        phone: phone ?? "",
        notify_email: true,
        notify_sms: true,
        notify_push: true,
      },
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (data.user && data.session) {
    await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        phone: phone || null,
        notify_email: true,
        notify_sms: true,
        notify_push: true,
      })
      .eq("id", data.user.id);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/?joined=1");
}
