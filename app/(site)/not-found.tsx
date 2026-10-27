import Link from "next/link";
import { getNotFoundCopy } from "@/lib/sanity/content";
import { buttonClasses } from "@/components/ui/ButtonLink";

/** Branded 404 (site chrome). Copy: Sanity uiCopy.notFound (CMS v1.6, fixture back-fill). */
export default async function NotFound() {
  const copy = await getNotFoundCopy();
  return (
    <section className="container-site py-32 text-center">
      <h1 className="text-h1">{copy.heading}</h1>
      <p className="mt-4 text-body-lg text-text-secondary">{copy.body}</p>
      <Link href={copy.homeHref} className={buttonClasses("primary", "lg", "mt-8")}>
        {copy.homeLabel}
      </Link>
    </section>
  );
}
