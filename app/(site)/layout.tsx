import type { ReactNode } from "react";
import { getAnnouncement, getFooterCopy, getSiteSettings } from "@/lib/sanity/content";
import { AnnouncementBanner } from "@/components/sections/global/AnnouncementBanner";
import { SiteHeader } from "@/components/sections/global/SiteHeader";
import { SiteFooter } from "@/components/sections/global/SiteFooter";
import { PageTransition } from "@/components/motion/PageTransition";

/** Site chrome: skip link, banner (2.1.10), header, <main> (page transition), footer (2.1.11). */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, announcement, footerCopy] = await Promise.all([
    getSiteSettings(),
    getAnnouncement(),
    getFooterCopy(),
  ]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <AnnouncementBanner announcement={announcement} />
      <SiteHeader settings={settings} />
      <main id="main" tabIndex={-1} className="outline-none">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter settings={settings} copy={footerCopy} />
    </>
  );
}
