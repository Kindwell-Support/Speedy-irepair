import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPolicyChrome, getPolicyPage } from "@/lib/sanity/content";
import type { PolicySlug } from "@/lib/sanity/types";
import { pageMetadata } from "@/lib/page/meta";
import { jsonLdForPolicy } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RichText } from "@/components/ui/RichText";
import { Notice } from "@/components/ui/Notice";
import { PageHero } from "@/components/ui/PageHero";
import { headingToc } from "@/components/ui/headingId";
import { PolicyToc } from "@/components/sections/policies/PolicyToc";
import { PolicyMeta } from "@/components/sections/policies/PolicyMeta";
import { RelatedPolicies } from "@/components/sections/policies/RelatedPolicies";

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

/** R12–R14 — PolicyLayout (design): hero + meta, sticky contents list ≥lg / disclosure below, verbatim text, other policies. */
export default async function PolicyPage({ params }: Params) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const [page, chrome, ...all] = await Promise.all([
    getPolicyPage(slug),
    getPolicyChrome(),
    ...SLUGS.map((s) => getPolicyPage(s)),
  ]);
  if (!page) notFound();
  const toc = [{ id: "intro", text: chrome.introLabel }, ...headingToc(page.body)];
  const others = SLUGS.flatMap((s, i) => {
    const p = all[i];
    return s !== slug && p ? [{ href: `/policies/${s}`, title: p.title }] : [];
  });
  return (
    <>
      <JsonLd data={jsonLdForPolicy(`/policies/${slug}`)} />
      <Breadcrumbs data={jsonLdForPolicy(`/policies/${slug}`)} />
      <PageHero
        hero={{ eyebrow: page.eyebrow, headline: page.title, subline: chrome.sublines[slug] }}
      >
        <PolicyMeta
          lastUpdated={page.lastUpdated}
          sourceUrl={page.sourceUrl}
          lastUpdatedLabel={chrome.lastUpdatedLabel}
          sourceLabel={chrome.sourceLabel}
        />
      </PageHero>
      <section aria-label={page.title} className="container-site py-16">
        <div className="grid gap-8 lg:grid-cols-[3fr_9fr] lg:gap-16 [&>*]:min-w-0">
          <PolicyToc label={chrome.tocLabel} items={toc} />
          <article className="break-words" data-testid="policy-body">
            <div id="intro" className="scroll-mt-24" />
            {page.needsReview || page.isPlaceholder ? (
              <Notice tone="staging" className="mb-4">
                <span data-testid="policy-review-note">
                  <strong className="font-semibold">{chrome.reviewLabel}</strong>
                  {page.reviewNote ? <> {page.reviewNote}</> : null}
                </span>
              </Notice>
            ) : null}
            <RichText value={page.body} />
            <RelatedPolicies label={chrome.otherPoliciesLabel} links={others} />
          </article>
        </div>
      </section>
    </>
  );
}
