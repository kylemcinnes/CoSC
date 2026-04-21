import type { Metadata } from "next";

import { SermonCard } from "@/components/sermon-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { sermonThumbnailUrl } from "@/lib/media";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sermons",
  description: `Searchable archive of preaching from ${SITE_NAME} — grace, holiness, and second chances in Christ.`,
  alternates: { canonical: `${getSiteUrl()}/sermons` },
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

/**
 * Hybrid search: Postgres full-text via `search_vector` (see schema.sql).
 * Semantic / vector similarity: add a match_sermons RPC once embeddings are populated (pgvector).
 */
export default async function SermonsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim();
  const from = first(sp.from);
  const to = first(sp.to);
  const book = first(sp.book)?.trim();
  const tag = first(sp.tag)?.trim();

  const supabase = await createClient();
  let query = supabase.from("sermons").select("*").order("preached_at", { ascending: false });

  if (q) {
    query = query.textSearch("search_vector", q, { type: "websearch", config: "english" });
  }
  if (from) query = query.gte("preached_at", from);
  if (to) query = query.lte("preached_at", to);
  if (book) query = query.contains("bible_books", [book]);
  if (tag) query = query.contains("tags", [tag]);

  const { data: sermons, error } = await query;

  const thumbs = await Promise.all(
    (sermons ?? []).map(async (s) => ({
      id: s.id,
      url: await sermonThumbnailUrl(s.thumbnail_path),
    })),
  );
  const thumbById = Object.fromEntries(thumbs.map((t) => [t.id, t.url]));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-primary sm:text-4xl">Sermon archive</h1>
        <p className="max-w-2xl text-muted-foreground">
          Search by keyword, filter by date or Scripture focus, and press deeper into the Word with us.
        </p>
      </header>

      <form className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6" method="get">
        <div className="lg:col-span-2">
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" defaultValue={q} placeholder="Grace, repentance, Port Credit…" className="mt-1.5" />
          <p className="mt-1 text-xs text-muted-foreground">Full-text today; vector “meaning” search ready in schema.</p>
        </div>
        <div>
          <Label htmlFor="from">From</Label>
          <Input id="from" name="from" type="date" defaultValue={from} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input id="to" name="to" type="date" defaultValue={to} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="book">Bible book</Label>
          <Input id="book" name="book" defaultValue={book} placeholder="John" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="tag">Subject tag</Label>
          <Input id="tag" name="tag" defaultValue={tag} placeholder="Second Chances" className="mt-1.5" />
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-6">
          <Button type="submit" className="w-full sm:w-auto">
            Apply filters
          </Button>
        </div>
      </form>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error.message}
        </p>
      ) : null}

      {!sermons?.length ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          No sermons match yet. Admins can upload messages from <code className="rounded bg-muted px-1">/admin</code>.
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sermons.map((sermon) => (
            <li key={sermon.id}>
              <SermonCard sermon={sermon} thumbUrl={thumbById[sermon.id]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
