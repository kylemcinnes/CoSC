import Link from "next/link";
import { Church, ChevronDown } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/site";

import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/sermons", label: "Sermons" },
  { href: "/live", label: "Live" },
  { href: "/register", label: "Join" },
  { href: "/dashboard", label: "My account" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-primary sm:text-base"
          aria-label={`${SITE_NAME} home`}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-1 ring-[color:var(--brand-gold)]/30">
            <Church className="size-4" aria-hidden />
          </span>
          <span className="hidden leading-tight sm:inline">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <details className="group relative md:hidden">
          <summary
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "list-none [&::-webkit-details-marker]:hidden",
            )}
            aria-label="Open menu"
          >
            <ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden />
          </summary>
          <div
            className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover p-2 shadow-lg"
            role="menu"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start text-popover-foreground",
                )}
                role="menuitem"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </details>

        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "sm" }),
            "hidden border border-[color:var(--brand-gold)]/40 md:inline-flex",
          )}
        >
          Join the family
        </Link>
      </div>
    </header>
  );
}
