import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPolicyPage } from "@/lib/sanity/content";
import type { PolicySlug } from "@/lib/sanity/types";
import { pageMetadata } from "@/lib/page/meta";
import { jsonLdForPolicy } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RichText } from "@/components/ui/RichText";
import { Notice } from "@/components/ui/Notice";

const SLUGS = ["shipping-return", "privacy", "terms"] as const satisfies readonly PolicySlug[];
const isSlug = (s: string): s is PolicySlug => (SLUGS as readonly string[]).includes(s);

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const page = await getPolicyPage(slug);
  return pageMetadata(`/policies/${slug}`, page?.seo);
}

/** R12–R14 — policy text from the current site (verbatim), editable in Sanity. */
export default async function PolicyPage({ params }: Params) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const page = await getPolicyPage(slug);
  if (!page) notFound();
  return (
    <>
      <JsonLd data={jsonLdForPolicy(`/policies/${slug}`)} />
      <Breadcrumbs data={jsonLdForPolicy(`/policies/${slug}`)} />
      <article className="container-site max-w-3xl break-words py-16 md:py-24">
        <h1 className="text-h1">{page.title}</h1>
        {page.isPlaceholder ? (
          <Notice tone="staging" className="mt-6">
            Placeholder text pending review.
          </Notice>
        ) : null}
        <div className="mt-10">
          <RichText value={page.body} />
        </div>
      </article>
    </>
  );
}
