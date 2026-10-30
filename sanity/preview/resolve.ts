import { defineLocations, type PresentationPluginOptions } from "sanity/presentation";

/** Presentation tool: maps documents to the routes that render them (visual editing in draft mode). */
const at = (title: string, href: string) => defineLocations({ message: title, locations: [{ title, href }] });

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    homePage: at("Home", "/"),
    servicesPage: at("Services", "/services"),
    service: at("Services", "/services"),
    shopPage: at("Shop", "/shop"),
    sellPage: at("Sell Your Device", "/sell-your-device"),
    quotePage: at("Instant Quote", "/instant-quote"),
    schedulePage: at("Repair booking", "/repair"),
    faqPage: at("FAQ", "/faq"),
    faq: at("FAQ", "/faq"),
    aboutPage: at("About", "/about"),
    financingPage: at("Financing", "/financing"),
    homeInternetPage: at("Home Internet", "/home-internet"),
    policyPage: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({ locations: [{ title: doc?.title ?? "Policy", href: `/policies/${doc?.slug ?? ""}` }] }),
    }),
  },
};
