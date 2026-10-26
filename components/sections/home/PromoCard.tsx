import type { Promotion } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";
import { cn } from "@/lib/utils/cn";

/** Decorative icon inferred from the CTA target (design: gift / wifi / card). Presentational only. */
function promoIcon(p: Promotion, feature: boolean): LineIconName {
  const href = p.cta.href.toLowerCase();
  if (href.includes("acima") || href.includes("financ")) return "card";
  if (feature) return "gift";
  if (href.includes("internet") || href.includes("jotform")) return "wifi";
  return "tag";
}

/**
 * Design home.html `.promo` card. The first (feature) card spans 6/12 at lg with the red radial glow,
 * optional brand badge, t-h3 title and a primary button; the others use t-h4 and an arrow link.
 * Title = the public promo text (CMS `text`), falling back to the document title.
 */
export function PromoCard({ promo, feature }: { promo: Promotion; feature: boolean }) {
  const external = promo.cta.external || /^https?:\/\//.test(promo.cta.href);
  return (
    <li
      data-testid="promo-card"
      className={cn(
        "flex min-h-[280px] flex-col gap-6 overflow-hidden rounded-xl border p-8",
        feature
          ? "border-[rgb(237_28_36/0.3)] bg-surface bg-[radial-gradient(120%_100%_at_100%_100%,rgb(237_28_36/0.28),transparent_55%)]"
          : "border-border-subtle bg-surface",
      )}
    >
      <span className="text-brand">
        <LineIcon name={promoIcon(promo, feature)} size={32} />
      </span>
      {promo.badge ? (
        <span className="before:size-1.5 inline-flex items-center gap-2 self-start rounded-full border border-[rgb(237_28_36/0.35)] bg-primary-tint px-3 py-1 text-caption font-semibold text-text before:rounded-full before:bg-brand before:content-['']">
          {promo.badge}
        </span>
      ) : null}
      <h3 className={cn("text-balance", feature ? "text-h3" : "text-h4")}>
        <PlaceholderMark show={promo.isPlaceholder}>{promo.body || promo.title}</PlaceholderMark>
      </h3>
      <ButtonLink
        cta={{ ...promo.cta, variant: feature ? "primary" : "link" }}
        className={cn(
          "mt-auto self-start",
          !feature && "text-body font-semibold text-text hover:text-primary-text",
        )}
      >
        {promo.cta.label}
        <LineIcon name={external ? "arrowUpRight" : "arrowRight"} size={16} />
      </ButtonLink>
    </li>
  );
}
