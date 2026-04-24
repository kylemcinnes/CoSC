import { z } from "zod";

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

/** Email + password sign-up (Supabase Auth requires a password for email registration). */
export const registerSignUpSchema = z.object({
  fullName: z.preprocess(emptyToUndef, z.string().trim().max(120).optional()),
  email: z.string().trim().email(),
  phone: z.preprocess(emptyToUndef, z.string().trim().max(32).optional()),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.preprocess(emptyToUndef, z.string().trim().max(4000).optional()),
  startsAt: z.string().min(1),
  isLive: z.boolean().optional(),
});

export const sermonSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.preprocess(emptyToUndef, z.string().trim().max(8000).optional()),
  preachedAt: z.string().min(1),
  durationSeconds: z.coerce.number().int().min(0).max(86400).optional(),
  videoUrl: z.preprocess(emptyToUndef, z.string().url().optional()),
  audioUrl: z.preprocess(emptyToUndef, z.string().url().optional()),
  keyVerses: z.preprocess(emptyToUndef, z.string().trim().max(2000).optional()),
  tags: z.preprocess(emptyToUndef, z.string().trim().max(2000).optional()),
  bibleBooks: z.preprocess(emptyToUndef, z.string().trim().max(2000).optional()),
});
