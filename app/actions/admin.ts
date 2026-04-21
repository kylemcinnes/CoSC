"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";

import { eventSchema, sermonSchema } from "./schemas";

export async function createEvent(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();
  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startsAt: formData.get("startsAt"),
    isLive: formData.get("isLive") === "on",
  });
  if (!parsed.success) {
    redirect("/admin?error=invalid_event");
  }
  const { error } = await supabase.from("events").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    is_live: parsed.data.isLive ?? false,
    created_by: user.id,
  });

  if (error) {
    redirect("/admin?error=event_db");
  }
  revalidatePath("/admin");
  revalidatePath("/live");
  redirect("/admin");
}

export async function toggleEventLive(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/admin?error=missing_event");
  }
  const { error } = await supabase.from("events").update({ is_live: true }).eq("id", id);
  if (error) {
    redirect("/admin?error=live_db");
  }
  revalidatePath("/admin");
  revalidatePath("/live");
  redirect("/admin");
}

function splitList(raw: string | undefined) {
  if (!raw) return [] as string[];
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Uploads sermon media + metadata. Thumbnail path is optional (from Supabase Storage).
 * Future: plug Whisper + LLM worker to fill transcript + tags automatically.
 */
export async function createSermon(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();

  const file = formData.get("media") as File | null;
  const thumb = formData.get("thumbnail") as File | null;

  const parsed = sermonSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    preachedAt: formData.get("preachedAt"),
    durationSeconds: formData.get("durationSeconds"),
    videoUrl: formData.get("videoUrl"),
    audioUrl: formData.get("audioUrl"),
    keyVerses: formData.get("keyVerses"),
    tags: formData.get("tags"),
    bibleBooks: formData.get("bibleBooks"),
  });
  if (!parsed.success) {
    redirect("/admin?error=invalid_sermon");
  }

  let thumbnailPath: string | null = null;
  if (thumb && thumb.size > 0) {
    const path = `thumbs/${crypto.randomUUID()}-${thumb.name.replace(/\s+/g, "-")}`;
    const { error: upErr } = await supabase.storage.from("sermon-media").upload(path, thumb, {
      upsert: false,
      contentType: thumb.type || "image/jpeg",
    });
    if (upErr) {
      redirect("/admin?error=upload_thumb");
    }
    thumbnailPath = path;
  }

  let videoUrl = parsed.data.videoUrl || null;
  let audioUrl = parsed.data.audioUrl || null;

  if (file && file.size > 0) {
    const path = `media/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
    const { error: upErr } = await supabase.storage.from("sermon-media").upload(path, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });
    if (upErr) {
      redirect("/admin?error=upload_media");
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("sermon-media").getPublicUrl(path);
    if (file.type.startsWith("audio")) audioUrl = publicUrl;
    else videoUrl = publicUrl;
  }

  const { error } = await supabase.from("sermons").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    preached_at: parsed.data.preachedAt,
    duration_seconds: parsed.data.durationSeconds ?? null,
    video_url: videoUrl,
    audio_url: audioUrl,
    thumbnail_path: thumbnailPath,
    key_verses: splitList(parsed.data.keyVerses),
    tags: splitList(parsed.data.tags),
    bible_books: splitList(parsed.data.bibleBooks),
    transcript: [],
    created_by: user.id,
  });

  if (error) {
    redirect("/admin?error=sermon_db");
  }
  revalidatePath("/sermons");
  revalidatePath("/admin");
  redirect("/admin");
}
