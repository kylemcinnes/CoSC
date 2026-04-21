import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const site = getSiteUrl();

  return (
    <footer className="mt-auto border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="font-heading text-lg font-semibold text-brand-gold">{SITE_NAME}</p>
            <p className="max-w-md text-sm leading-relaxed text-primary-foreground/85">
              A biblical community in the GTA anchored in grace, redemption, and the restoring love of
              Jesus Christ.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm sm:justify-items-end">
            <div className="space-y-2 sm:text-right">
              <p className="font-medium text-brand-gold">Gather</p>
              <ul className="space-y-1 text-primary-foreground/85">
                <li>
                  <Link className="underline-offset-4 hover:underline" href="/live">
                    Live worship
                  </Link>
                </li>
                <li>
                  <Link className="underline-offset-4 hover:underline" href="/sermons">
                    Sermon archive
                  </Link>
                </li>
                <li>
                  <Link className="underline-offset-4 hover:underline" href="/register">
                    Join the family
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2 sm:text-right">
              <p className="font-medium text-brand-gold">Connect</p>
              <ul className="space-y-1 text-primary-foreground/85">
                <li>
                  <a className="underline-offset-4 hover:underline" href={site}>
                    {site.replace(/^https?:\/\//, "")}
                  </a>
                </li>
                <li>Port Credit, Mississauga, ON</li>
              </ul>
            </div>
          </div>
        </div>
        <Separator className="bg-primary-foreground/15" />
        <div className="flex flex-col gap-2 text-xs text-primary-foreground/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {SITE_NAME}. All rights reserved.</p>
          <p className="text-primary-foreground/80">Made with love for the Kingdom.</p>
        </div>
      </div>
    </footer>
  );
}
