import { notFound } from "next/navigation";

/**
 * Unmatched URLs would otherwise get Next's bare root 404 (no header/main/footer landmarks — axe region /
 * landmark-one-main). Routing them here renders app/(site)/not-found.tsx inside the site chrome.
 */
export default function MissingPage(): never {
  notFound();
}
