import type { Announcement } from "@/lib/sanity/types";
import { BannerDismiss } from "./BannerDismiss";

const STORAGE_KEY = "sir-banner-dismissed";

/** The dismissal is remembered per announcement (id + text), so a new or edited promo shows again. */
const bannerValue = (a: Announcement) => `${a.id}:${a.text}`;

/** Runs before the banner is parsed: if this exact announcement was dismissed, hide it (and its height) pre-paint. */
const gate = (value: string) =>
  `try{if(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})===${JSON.stringify(value)})document.documentElement.setAttribute("data-banner","off")}catch(e){}`;

/**
 * Spec 2.1.0 / REQ-002/003: Sanity-editable banner above the header on every page; visitors can dismiss it.
 * Spacer | message | close: the message stays centred and the × lines up with the header CTA's right edge.
 */
export function AnnouncementBanner({ announcement }: { announcement: Announcement | null }) {
  if (!announcement?.enabled) return null;
  const value = bannerValue(announcement);
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: gate(value) }} />
      <div data-announcement className="relative z-banner bg-primary text-text">
        <div className="container-wide grid min-h-banner grid-cols-[2rem_1fr_2rem] items-center gap-2 py-1 text-center text-body-sm font-semibold">
          <a
            href={announcement.href}
            className="col-start-2 underline-offset-4 hover:underline"
            {...(announcement.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {announcement.text}
            {announcement.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
          </a>
          <BannerDismiss storageKey={STORAGE_KEY} storageValue={value} />
        </div>
      </div>
    </>
  );
}
