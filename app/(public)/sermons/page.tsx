import type { Metadata } from "next";

import { SermonCard } from "@/components/sermon-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { sermonThumbnailUrl } from "@/lib/media";
import { SITE_NAME, getSiteUrl } from "@/lib/site";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Sermons",
  description: `Searchable archive of preaching from ${SITE_NAME} — grace, holiness, and second chances in Christ.`,
  alternates: { canonical: `${getSiteUrl()}/sermons` },
};

type SearchParams = Record<string, string | string[] | undefined>;
type SermonRow = Database["public"]["Tables"]["sermons"]["Row"];

function first(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

function ilikePattern(raw: string) {
  const t = raw.replace(/[%_]/g, " ").trim().slice(0, 80);
  if (!t) return null;
  return `%${t}%`;
}

/**
 * Hybrid search: Postgres full-text on `search_vector` plus a broad `ilike` OR on title/description.
 * Semantic / vector similarity: add `supabase.rpc("match_sermons", { query_embedding, match_threshold, match_count })`
 * once `sermons.embedding` is populated (pgvector + RAG over transcripts).
 */
async function fetchSermons(sp: SearchParams) {
  const q = first(sp.q)?.trim();
  const from = first(sp.from);
  const to = first(sp.to);
  const book = first(sp.book)?.trim();
  const tag = first(sp.tag)?.trim();
  const verse = first(sp.verse)?.trim();

  const supabase = createClient();

  const base = () => {
    let query = supabase.from("sermons").select("*");
    if (from) query = query.gte("preached_at", from);
    if (to) query = query.lte("preached_at", to);
    if (book) query = query.contains("bible_books", [book]);
    if (tag) query = query.contains("tags", [tag]);
    return query;
  };

  let rows: SermonRow[] = [];
  let errorMessage: string | null = null;

  if (q) {
    const ftsRes = await base()
      .order("preached_at", { ascending: false })
      .textSearch("search_vector", q, { type: "websearch", config: "english" });
    if (ftsRes.error) {
      errorMessage = ftsRes.error.message;
    }
    rows = ftsRes.data ?? [];

    const pat = ilikePattern(q);
    if (pat) {
      const likeRes = await base()
        .order("preached_at", { ascending: false })
        .or(`title.ilike.${pat},description.ilike.${pat}`);
      if (likeRes.error && !errorMessage) {
        errorMessage = likeRes.error.message;
      }
      const seen = new Set(rows.map((r) => r.id));
      for (const r of likeRes.data ?? []) {
        if (!seen.has(r.id)) {
          rows.push(r);
          seen.add(r.id);
        }
      }
    }
    rows.sort((a, b) => (a.preached_at < b.preached_at ? 1 : -1));
  } else {
    const res = await base().order("preached_at", { ascending: false });
    if (res.error) {
      errorMessage = res.error.message;
    }
    rows = res.data ?? [];
  }

  if (verse) {
    const v = verse.toLowerCase();
    rows = rows.filter(
      (s) =>
        s.key_verses?.some((k) => k.toLowerCase().includes(v)) ||
        s.tags?.some((t) => t.toLowerCase().includes(v)) ||
        s.bible_books?.some((b) => b.toLowerCase().includes(v)),
    );
  }

  return { rows, errorMessage };
}

export default async function SermonsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim();
  const from = first(sp.from);
  const to = first(sp.to);
  const book = first(sp.book)?.trim();
  const tag = first(sp.tag)?.trim();
  const verse = first(sp.verse)?.trim();

  const { rows: sermons, errorMessage } = await fetchSermons(sp);

  const thumbs = await Promise.all(
    sermons.map(async (s) => ({
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
          <p className="mt-1 text-xs text-muted-foreground">
            Combines full-text (`search_vector`) with title/description matching. Vector semantic search: see code comment
            above.
          </p>
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
        <div className="sm:col-span-2 lg:col-span-6">
          <Label htmlFor="verse">Verse / reference contains</Label>
          <Input
            id="verse"
            name="verse"
            defaultValue={verse}
            placeholder="e.g. Luke 15 or prodigal"
            className="mt-1.5 max-w-xl"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Client-side filter on returned rows (key verses, tags, books). For server-side substring on arrays, add a small
            SQL view or RPC later.
          </p>
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-6">
          <Button type="submit" className="w-full sm:w-auto">
            Apply filters
          </Button>
        </div>
      </form>

      {errorMessage ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {!sermons.length ? (
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
