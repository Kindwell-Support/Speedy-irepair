import { SHOP_TIME_ZONE } from "./repair-time";

/** "October 29, 2026" in the shop's time zone, so a post dated late evening doesn't show the next day. */
export const formatPostDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TIME_ZONE, year: "numeric", month: "long", day: "numeric" }).format(
    new Date(iso),
  );
