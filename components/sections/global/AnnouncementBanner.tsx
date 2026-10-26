import type { Announcement } from "@/lib/sanity/types";
import { A11Y } from "@/components/ui/a11yStrings";

/** Spec 2.1.0 / REQ-002/003: Sanity-editable banner above the header on every page. */
export function AnnouncementBanner({ announcement }: { announcement: Announcement | null }) {
  if (!announcement?.enabled) return null;
  return (
    <div
      role="region"
      aria-label={A11Y.announcement}
      data-section="banner"
      data-testid="announcement-banner"
      className="relative z-banner bg-primary text-text"
    >
      <div className="container-site min-h-banner flex items-center justify-center py-2 text-center text-body-sm font-semibold">
        <a
          href={announcement.href}
          className="underline-offset-4 hover:underline focus-visible:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          {...(announcement.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {announcement.text}
          {announcement.external ? <span className="sr-only">{A11Y.opensInNewTab}</span> : null}
        </a>
      </div>
    </div>
  );
}
