import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { jsonLdForPartnerPage } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PartnerPage, type PartnerPageCopy } from "@/components/sections/partner/PartnerPage";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/education", null);
}

const COPY: PartnerPageCopy = {
  audience: "education",
  headline: "Device Repair for Schools and Education Programs",
  subline:
    "Repairs and troubleshooting for the tablets, laptops and phones your students and staff use every day. Tell us what you need and we'll put together a plan for your school or program.",
  photo: "devices",
  benefitsHeading: "Why local schools work with us",
  benefits: [
    {
      title: "Devices back in class, fast",
      body: "Most repairs are done the same day, often in about 45 minutes, so students and teachers aren't left without their devices.",
    },
    {
      title: "Repairs that last",
      body: "Quality replacement parts backed by our 90-day warranty, so repaired devices keep working through the school year.",
    },
    {
      title: "A local partner",
      body: "One shop right here in Akron for your tablets, laptops and phones, with real people you can call or walk in to see.",
    },
  ],
  formHeading: "Tell us about your school or program",
};

/** Education: repair and troubleshooting for local schools and education programs, with an inquiry form to GHL. */
export default async function EducationPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <JsonLd data={jsonLdForPartnerPage("/education", "Education")} />
      <PartnerPage copy={COPY} business={settings.business} />
    </>
  );
}
