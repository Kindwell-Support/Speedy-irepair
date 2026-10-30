import type { Metadata } from "next";
import { getHomePage, getSiteSettings } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { jsonLdForContact } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/sections/forms/ContactForm";
import { LocationContact } from "@/components/sections/shared/LocationContact";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/contact", null);
}

/** Contact form (lands in GHL General Inquiries), then the shop's address, hours and map. */
export default async function ContactPage() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()]);
  return (
    <>
      <JsonLd data={jsonLdForContact()} />
      <PageHero
        hero={{
          headline: "Contact Us",
          subline: "Questions about a repair, a device or an order? Send us a message and we'll get back to you.",
        }}
        photo="storeCounter"
      />
      <div className="container-site max-w-3xl py-16">
        <ContactForm idPrefix="contact-page" />
      </div>
      <LocationContact
        copy={home.locationSection}
        business={settings.business}
        directionsLabel={home.locationSection.directionsLabel}
        showForm={false}
        id="contact-location"
      />
    </>
  );
}
