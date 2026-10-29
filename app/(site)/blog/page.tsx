import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogPage, getPosts } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { formatPostDate } from "@/lib/blog";
import { jsonLdForBlog } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/blog", (await getBlogPage()).seo);
}

/** Blog index — posts published in the Studio (/studio → Blog posts), newest first. */
export default async function BlogIndexPage() {
  const [page, posts] = await Promise.all([getBlogPage(), getPosts()]);
  return (
    <>
      <JsonLd data={jsonLdForBlog()} />
      <PageHero hero={page.hero} />
      <div className="container-site pb-24">
        {posts.length ? (
          <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  {p.coverImage ? (
                    <div className="photo mb-5 aspect-[16/10]">
                      <Image
                        src={p.coverImage.src}
                        alt={p.coverImage.alt}
                        fill
                        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                        className="transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}
                  <time dateTime={p.publishedAt} className="text-body text-text-secondary tabular-nums">
                    {formatPostDate(p.publishedAt)}
                  </time>
                  <h2 className="mt-2 text-h4 group-hover:text-primary-text">{p.title}</h2>
                  {p.excerpt ? <p className="mt-3 max-w-prose text-body text-text-secondary">{p.excerpt}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-lg text-text-secondary">No posts yet. Check back soon.</p>
        )}
      </div>
    </>
  );
}
