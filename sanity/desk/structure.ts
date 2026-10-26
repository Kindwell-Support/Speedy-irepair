import type { StructureResolver } from "sanity/structure";

/** Desk structure: singletons pinned at top (fixed ids), then collections grouped by purpose. */
const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Speedy iRepair")
    .items([
      singleton(S, "siteSettings", "Site settings"),
      S.divider(),
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              singleton(S, "homePage", "Home"),
              singleton(S, "servicesPage", "Services"),
              singleton(S, "shopPage", "Shop"),
              singleton(S, "sellPage", "Sell Your Device"),
              singleton(S, "quotePage", "Instant Quote"),
              singleton(S, "schedulePage", "Schedule Repair"),
              singleton(S, "faqPage", "FAQ"),
              singleton(S, "aboutPage", "About"),
              singleton(S, "financingPage", "Financing"),
              singleton(S, "homeInternetPage", "Home Internet"),
              S.divider(),
              S.documentTypeListItem("policyPage").title("Policy pages"),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("faq").title("FAQs"),
      S.documentTypeListItem("howItWorksStep").title("How-it-works steps"),
      S.documentTypeListItem("valueProp").title("Value propositions"),
      S.documentTypeListItem("brand").title("Brands"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("teamMember").title("Team"),
      S.divider(),
      S.documentTypeListItem("announcement").title("Announcement banner"),
      S.documentTypeListItem("promotion").title("Promotions"),
      S.documentTypeListItem("shopCollectionConfig").title("Shop categories (editorial)"),
      S.divider(),
      S.documentTypeListItem("formSubmission").title("Form submissions"),
      singleton(S, "llmsDocument", "llms.txt"),
    ]);
