import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  alternates: { canonical: `${getSiteUrl()}/admin` },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-full bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-primary">Admin</p>
          <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-brand-teal")}>
            ← Site home
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
