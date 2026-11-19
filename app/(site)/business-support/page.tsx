import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { jsonLdForPartnerPage } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PartnerPage, type PartnerPageCopy } from "@/components/sections/partner/PartnerPage";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/business-support", null);
}

const COPY: PartnerPageCopy = {
  audience: "business",
  headline: "Device Repair for Local Businesses",
  subline:
    "Repairs and troubleshooting for the phones, tablets and laptops your team relies on. Tell us what you need and we'll put together a plan for your business.",
  photo: "storeCounter",
  benefitsHeading: "Why local businesses work with us",
  benefits: [
    {
      title: "Less downtime",
      body: "Most repairs are done the same day, often in about 45 minutes, so your team gets back to work fast.",
    },
    {
      title: "Repairs you can count on",
      body: "Quality replacement parts backed by our 90-day warranty, so a fixed device stays fixed.",
    },
    {
      title: "A local partner",
      body: "One shop right here in Akron for every device your business uses, with real people you can call or walk in to see.",
    },
  ],
  formHeading: "Tell us about your business",
};

/** Business Support: repair and troubleshooting for local businesses, with an inquiry form to GHL. */
export default async function BusinessSupportPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <JsonLd data={jsonLdForPartnerPage("/business-support", "Business Support")} />
      <PartnerPage copy={COPY} business={settings.business} />
    </>
  );
}
