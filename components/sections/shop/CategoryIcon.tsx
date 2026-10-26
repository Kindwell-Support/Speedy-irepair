import type { CategoryKey } from "@/lib/shop/types";
import { LeadIcon } from "@/components/sections/forms/lead/LeadIcon";

const MAP = {
  iphones: "phone",
  ipads: "tablet",
  "apple-watch": "watch",
  macbooks: "laptop",
  accessories: "other",
} as const;

export function CategoryIcon({ category, size = 28 }: { category: CategoryKey; size?: number }) {
  return <LeadIcon name={MAP[category]} size={size} className="text-brand" />;
}
