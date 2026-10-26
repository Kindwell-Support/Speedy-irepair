import type { ServicesChromeCopy } from "../types";

/** Design services.html: .svc-index label, .svc-chips, pre-footer .cta-band. */
export const servicesChrome: ServicesChromeCopy = {
  indexLabel: "{count} services",
  indexAriaLabel: "Services index",
  chipsAriaLabel: "Jump to service",
  ctaSection: {
    heading: "Cracked, dead or soaked? Bring it in.",
    intro: "Most repairs are done in 45 minutes while you wait.",
    ctas: [
      { label: "Schedule Repair", href: "/schedule-repair", external: false, variant: "primary" },
      { label: "Call us", href: "tel:+18553773339", external: false, variant: "secondary" },
    ],
  },
};
