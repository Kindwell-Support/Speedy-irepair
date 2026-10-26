/** Visible page intro under the hero (SEO G4). CMS `intro` (contract v1.3); on quote/schedule it carries the Service description. */
export function ServiceSummary({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <div className="container-site pt-10">
      <p className="max-w-prose text-body-lg text-text-secondary">{text}</p>
    </div>
  );
}
