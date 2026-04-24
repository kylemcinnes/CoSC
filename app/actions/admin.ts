"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { getNextSundayServiceToronto } from "@/lib/sunday-toronto";

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
  revalidatePath("/events");
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
  revalidatePath("/events");
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

/** Prefix for idempotent demo rows (safe for SQL LIKE / ILIKE). */
const SEED_PREFIX = "COSC seed demo — ";

/** Inserts demo sermons + one upcoming Sunday event (idempotent prefix `[COSC Seed]`). */
export async function seedSampleData(): Promise<void> {
  const { supabase, user } = await requireAdmin();

  await supabase.from("sermons").delete().like("title", `${SEED_PREFIX}%`);
  await supabase.from("events").delete().like("title", `${SEED_PREFIX}%`);

  const nextSunday = getNextSundayServiceToronto();
  const demoVideo = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm";

  const { error: evErr } = await supabase.from("events").insert({
    title: `${SEED_PREFIX} Sunday gathering`,
    description: "Sample upcoming service row — safe to delete from the Table Editor.",
    starts_at: nextSunday.toISOString(),
    is_live: false,
    created_by: user.id,
  });
  if (evErr) {
    redirect("/admin?error=seed_event");
  }

  const { error: serErr } = await supabase.from("sermons").insert([
    {
      title: `${SEED_PREFIX} The Father still runs`,
      description: "Grace for prodigals — sample sermon for layout and search.",
      preached_at: new Date().toISOString().slice(0, 10),
      duration_seconds: 2100,
      video_url: demoVideo,
      key_verses: ["Luke 15:11-32", "John 3:16"],
      tags: ["Grace", "Second Chances", "Repentance"],
      bible_books: ["Luke", "John"],
      transcript: [],
      created_by: user.id,
    },
    {
      title: `${SEED_PREFIX} New mercies this morning`,
      description: "Hope for weary saints — sample sermon.",
      preached_at: new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10),
      duration_seconds: 1850,
      video_url: demoVideo,
      key_verses: ["Lamentations 3:22-23"],
      tags: ["Hope", "Mercy"],
      bible_books: ["Lamentations"],
      transcript: [],
      created_by: user.id,
    },
    {
      title: `${SEED_PREFIX} Port Credit invitation`,
      description: "Jesus welcomes sinners — sample sermon.",
      preached_at: new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10),
      duration_seconds: 1720,
      video_url: null,
      audio_url: null,
      key_verses: ["Matthew 11:28-30"],
      tags: ["Invitation", "Rest"],
      bible_books: ["Matthew"],
      transcript: [],
      created_by: user.id,
    },
  ]);
  if (serErr) {
    redirect("/admin?error=seed_sermon");
  }

  revalidatePath("/");
  revalidatePath("/sermons");
  revalidatePath("/events");
  revalidatePath("/live");
  revalidatePath("/admin");
  redirect("/admin?seed=1");
}
