import Link from "next/link";
import { buttonClasses } from "@/components/ui/ButtonLink";

/** Design .related-pol: "Other policies" + secondary buttons, top rule. */
export function RelatedPolicies({
  label,
  links,
}: {
  label: string;
  links: { href: string; title: string }[];
}) {
  if (!links.length) return null;
  return (
    <nav
      aria-label={label}
      className="mt-12 flex flex-wrap gap-2 border-t border-border-subtle pt-8"
    >
      <span className="w-full text-caption text-text-tertiary">{label}</span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={buttonClasses("secondary", "md", "h-control-sm px-4")}
        >
          {l.title}
        </Link>
      ))}
    </nav>
  );
}
