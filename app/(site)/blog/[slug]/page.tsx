import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { formatPostDate } from "@/lib/blog";
import { jsonLdForPost } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { RichText } from "@/components/ui/RichText";

type Params = { params: Promise<{ slug: string }> };

// Posts published after the build render on first request, then cache (ISR).
export const dynamicParams = true;
export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata(
    "/blog",
    {
      ...post.seo,
      metaTitle: post.seo?.metaTitle || `${post.title} | Speedy iRepair`,
      metaDescription: post.seo?.metaDescription || post.excerpt,
      ogImage: post.seo?.ogImage ?? post.coverImage,
    },
    `/blog/${slug}`,
  );
}

/** A single blog post, written and published in the Studio. Unpublished or future-dated posts 404. */
export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <>
      <JsonLd
        data={jsonLdForPost({
          slug,
          title: post.title,
          description: post.excerpt,
          publishedAt: post.publishedAt,
          author: post.author,
          image: post.coverImage?.src,
        })}
      />
      <article className="container-site max-w-3xl py-16 md:py-24">
        <Link href="/blog" className="text-body font-bold text-primary-text">
          ← All posts
        </Link>
        <h1 className="mt-6 text-h1">{post.title}</h1>
        <p className="mt-5 text-body text-text-secondary">
          <time dateTime={post.publishedAt} className="tabular-nums">
            {formatPostDate(post.publishedAt)}
          </time>
          {post.author ? <> · {post.author}</> : null}
        </p>
        {post.coverImage ? (
          <div className="photo mt-10 aspect-[16/9]">
            <Image src={post.coverImage.src} alt={post.coverImage.alt} fill priority sizes="(min-width: 768px) 48rem, 100vw" />
          </div>
        ) : null}
        <div className="mt-10">
          <RichText value={post.body} />
        </div>
      </article>
    </>
  );
}
