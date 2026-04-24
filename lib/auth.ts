import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/register");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !data?.is_admin) {
    redirect("/");
  }

  return { user, supabase };
}
