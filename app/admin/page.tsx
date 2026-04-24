import { createEvent, createSermon, seedSampleData, toggleEventLive } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const err = typeof sp.error === "string" ? sp.error : undefined;
  const seeded = sp.seed === "1";

  const supabase = createClient();
  const { data: events } = await supabase.from("events").select("*").order("starts_at", { ascending: false }).limit(10);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-primary">Church admin</h1>
        <p className="text-sm text-muted-foreground">
          Simple tools for events and sermon uploads. You can always fall back to the Supabase Table Editor if needed.
        </p>
        {err ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Something went wrong ({err}). Check Supabase logs and RLS policies.
          </p>
        ) : null}
        {seeded ? (
          <p className="rounded-lg border border-brand-teal/30 bg-brand-teal/10 px-3 py-2 text-sm text-brand-teal">
            Sample sermons and one event were inserted (titles prefixed with{" "}
            <code className="rounded bg-muted px-1">COSC seed demo —</code>). Remove them anytime from the Table Editor.
          </p>
        ) : null}
      </header>

      <Card className="border-brand-gold/30">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Who can use this page?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Access is enforced by Supabase Row Level Security: your user must have{" "}
            <code className="rounded bg-muted px-1">profiles.is_admin = true</code>. Set that flag in the Supabase Table
            Editor (or SQL) for your account — there is no separate admin password in the app yet.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Sample content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Seeds three demo sermons (two with a short sample video URL) and one upcoming Sunday event. Existing rows
            titled <code className="rounded bg-muted px-1">COSC seed demo — …</code> are removed first.
          </p>
          <form action={seedSampleData}>
            <Button type="submit" variant="secondary">
              Add sample sermons &amp; event
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Create event</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEvent} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="Sunday gathering" />
            </div>
            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} placeholder="Optional details for reminders…" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startsAt">Starts at (local)</Label>
              <Input id="startsAt" name="startsAt" type="datetime-local" required />
            </div>
            <div className="flex items-end gap-2">
              <input id="isLive" name="isLive" type="checkbox" className="size-4 accent-primary" />
              <Label htmlFor="isLive">Mark live immediately</Label>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save event</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Recent events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {!events?.length ? (
            <p className="text-muted-foreground">No events yet.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex flex-col justify-between gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium text-foreground">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ev.starts_at).toLocaleString("en-CA")} — live: {ev.is_live ? "yes" : "no"}
                    </p>
                  </div>
                  {!ev.is_live ? (
                    <form action={toggleEventLive}>
                      <input type="hidden" name="id" value={ev.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Go live now
                      </Button>
                    </form>
                  ) : (
                    <span className="text-xs font-medium text-brand-teal">Streaming flag on</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Upload sermon</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSermon} encType="multipart/form-data" className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="media">Video or audio file (optional if URLs below)</Label>
              <Input id="media" name="media" type="file" accept="video/*,audio/*" />
            </div>
            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail image (optional)</Label>
              <Input id="thumbnail" name="thumbnail" type="file" accept="image/*" />
            </div>
            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="s-title">Title</Label>
              <Input id="s-title" name="title" required />
            </div>
            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="s-desc">Description</Label>
              <Textarea id="s-desc" name="description" rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preachedAt">Preached on</Label>
              <Input id="preachedAt" name="preachedAt" type="date" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="durationSeconds">Duration (seconds)</Label>
              <Input id="durationSeconds" name="durationSeconds" type="number" min={0} placeholder="2400" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="videoUrl">Video URL (optional)</Label>
              <Input id="videoUrl" name="videoUrl" type="url" placeholder="https://…" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="audioUrl">Audio URL (optional)</Label>
              <Input id="audioUrl" name="audioUrl" type="url" placeholder="https://…" />
            </div>
            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="keyVerses">Key verses (comma-separated)</Label>
              <Input id="keyVerses" name="keyVerses" placeholder="John 3:16, Luke 15:11-32" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Subject tags</Label>
              <Input id="tags" name="tags" placeholder="Grace, Second Chances, Repentance" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bibleBooks">Bible books (comma-separated)</Label>
              <Input id="bibleBooks" name="bibleBooks" placeholder="John, Psalms" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Publish sermon</Button>
            </div>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Future: pipe uploads to an Edge worker with Whisper for transcripts + an LLM for auto-tags (
            <code className="rounded bg-muted px-1">embedding</code> column is ready in Postgres when pgvector is on).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
