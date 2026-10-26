/**
 * Lead-capture flow copy for /instant-quote and /sell-your-device, verbatim from
 * design/pages/{instant-quote,sell-your-device}.html. Lead capture only: NO prices (DECISIONS #5).
 * Option `key`s are the values submitted and must match lib/forms/schemas.ts enums.
 * Model lists are empty on purpose (CMS contract 2.4: no invented model lists, free-text input instead).
 */
import type { LeadFlowCopy, LeadFlowPageCopy } from "../types";
import { EXTERNAL_LINKS } from "./business";

const contact: LeadFlowCopy["contact"] = {
  nameLabel: "Name",
  phoneLabel: "Phone",
  emailLabel: "Email",
  detailsLabel: "Anything else? (optional)",
  consentLabel: "I agree to be contacted about my request by phone, text or email.",
  consentError: "Please agree to be contacted so we can send your quote.",
};

const shared = {
  stepCounter: "Step {n} of {total}",
  contact,
  chooseError: "Please choose one to continue.",
  submittingLede: "Sending…",
  submitError: {
    title: "We could not send your request.",
    body: "Your answers are saved. Try again, or call us at",
  },
  stagingNote:
    "Staging preview: this submission was validated but not stored or sent (form delivery is not configured yet).",
};

const deviceIcons = {
  iPhone: "phone",
  iPad: "tablet",
  Samsung: "phone",
  LG: "phone",
  Google: "phone",
  Other: "other",
} as const;

export const quoteFlow: LeadFlowPageCopy = {
  flow: {
    ...shared,
    ariaLabel: "Repair quote",
    steps: [
      {
        id: "device",
        label: "Device",
        title: "What device needs fixing?",
        lede: "Pick one. You can change it later.",
      },
      { id: "model", label: "Model", title: "Which model?", lede: null },
      {
        id: "issue",
        label: "Issue",
        title: "What is going on with it?",
        lede: "Choose the main issue.",
      },
      {
        id: "contact",
        label: "Contact",
        title: "Where should we send your quote?",
        lede: "We will contact you with your quote. Nothing is charged online.",
      },
    ],
    options: {
      device: (["iPhone", "iPad", "Samsung", "LG", "Google", "Other"] as const).map((k) => ({
        key: k,
        label: k,
        icon: deviceIcons[k],
      })),
      issue: [
        { key: "Cracked Screen", label: "Cracked Screen", icon: "phone" },
        { key: "Battery", label: "Battery", icon: "battery" },
        { key: "Charger Port", label: "Charger Port", icon: "port" },
        { key: "Camera", label: "Camera", icon: "camera" },
        { key: "Water Damage", label: "Water Damage", icon: "water" },
        { key: "Other", label: "Other", icon: "other" },
      ],
    },
    models: {},
    model: {
      searchLabel: "Search models",
      inputLabel: "Model",
      placeholder: "e.g. iPhone 13",
      notSureLabel: "Not sure / Other",
      help: 'Not sure? Choose "Not sure / Other" and we will figure it out together.',
    },
    buttons: {
      back: "Back",
      next: "Continue",
      submit: "Get my quote",
      submitting: "Sending",
      retry: "Try again",
    },
    success: {
      title: "Request received.",
      body: "Thanks. We will call or email you with your quote. Want to skip the wait? Book a time now.",
      ctas: [
        { label: "Schedule Repair", href: "/schedule-repair", variant: "primary" },
        { label: "Call us", href: "tel:+18553773339", variant: "secondary" },
      ],
    },
  },
  aside: [
    {
      label: "How it works",
      items: [
        { strong: "4 quick steps.", text: "Device, model, issue, contact." },
        { strong: "We get back to you", text: "with your quote." },
        {
          strong: "iPhone repairs typically take 45–60 minutes.",
          text: "Most Android repairs take 1–2 hours.",
        },
      ],
    },
    {
      label: "Good to know",
      items: [
        { text: "90-day warranty on all repairs." },
        { text: "No upfront payment for iPhone repairs. $20 deposit on Android repairs." },
      ],
    },
  ],
  asideLabel: "Why quote with us",
  contactCardLabel: "Rather talk?",
};

export const tradeInFlow: LeadFlowPageCopy = {
  flow: {
    ...shared,
    ariaLabel: "Trade-in quote",
    steps: [
      {
        id: "device",
        label: "Device",
        title: "What are you selling?",
        lede: "Pick the type of device.",
      },
      { id: "brand", label: "Brand", title: "Which brand?", lede: null },
      { id: "model", label: "Model", title: "Which model?", lede: null },
      {
        id: "condition",
        label: "Condition",
        title: "What condition is it in?",
        lede: "Be honest. It helps us get you the right offer.",
      },
      {
        id: "contact",
        label: "Contact",
        title: "Where should we send your quote?",
        lede: "We compare trade-in prices and contact you with your quote.",
      },
    ],
    options: {
      device: [
        { key: "Phone", label: "Phone", icon: "phone" },
        { key: "Tablet", label: "Tablet", icon: "tablet" },
        { key: "Smartwatch", label: "Smartwatch", icon: "watch" },
        { key: "Laptop", label: "Laptop", icon: "laptop" },
        { key: "Other", label: "Other", icon: "other" },
      ],
      // Labels/descriptions are Design's proposal (HANDOFF open issue 5); keys = CMS quoteConfig.tradeInConditions seed.
      condition: [
        {
          key: "Like New",
          label: "Like new",
          description: "No scratches, works perfectly",
          icon: "badge",
        },
        { key: "Good", label: "Good", description: "Light wear, works perfectly", icon: "check" },
        {
          key: "Fair",
          label: "Cracked or damaged",
          description: "Screen or body damage",
          icon: "phone",
        },
        {
          key: "Broken",
          label: "Does not power on",
          description: "Dead or unknown",
          icon: "power",
        },
      ],
    },
    models: {},
    model: {
      searchLabel: "Search models",
      inputLabel: "Model",
      placeholder: "e.g. Galaxy S22",
      notSureLabel: "Not sure / Other",
      help: 'Not sure? Choose "Not sure / Other".',
    },
    buttons: {
      back: "Back",
      next: "Continue",
      submit: "Request my quote",
      submitting: "Sending",
      retry: "Try again",
    },
    success: {
      title: "Request received.",
      body: "Thanks. We will contact you with your trade-in quote. You can also bring the device to the store.",
      ctas: [
        { label: "Visit our store", href: EXTERNAL_LINKS.maps, external: true, variant: "primary" },
        { label: "Call us for a quote", href: "tel:+18553773339", variant: "secondary" },
      ],
    },
  },
  asideLabel: "About trade-ins",
  aside: [{ label: "Brands we accept", body: "Apple, Samsung, LG, Google, Motorola and OnePlus." }],
  contactCardLabel: "Rather talk?",
};
