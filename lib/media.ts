import { createClient } from "@/lib/supabase/server";

/** Public URL for objects in the `sermon-media` bucket (see schema.sql). */
export async function sermonThumbnailUrl(path: string | null) {
  if (!path) return null;
  const supabase = await createClient();
  return supabase.storage.from("sermon-media").getPublicUrl(path).data.publicUrl;
}
