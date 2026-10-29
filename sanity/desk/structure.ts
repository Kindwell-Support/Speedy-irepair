import type { StructureResolver } from "sanity/structure";

/**
 * Desk structure, ordered by what the shop edits day to day: blog, homepage banner/promos, services & pricing,
 * FAQs, then pages and settings. Singletons have fixed ids. Dev-only types sit in the "Developer" folder.
 */
const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Speedy iRepair")
    .items([
      S.documentTypeListItem("post").title("Blog posts"),
      S.divider(),
      S.listItem()
        .title("Homepage banner & promos")
        .child(
          S.list()
            .title("Homepage banner & promos")
            .items([
              S.documentTypeListItem("announcement").title("Announcement banner"),
              S.documentTypeListItem("promotion").title("Promotions"),
            ]),
        ),
      S.documentTypeListItem("service").title("Services & pricing"),
      S.documentTypeListItem("faq").title("FAQs"),
      S.divider(),
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              singleton(S, "homePage", "Home"),
              singleton(S, "servicesPage", "Services"),
              singleton(S, "blogPage", "Blog"),
              singleton(S, "shopPage", "Shop"),
              singleton(S, "sellPage", "Sell Your Device"),
              singleton(S, "quotePage", "Instant Quote"),
              singleton(S, "schedulePage", "Schedule Repair"),
              singleton(S, "faqPage", "FAQ"),
              singleton(S, "financingPage", "Financing"),
              singleton(S, "homeInternetPage", "Home Internet"),
              singleton(S, "aboutPage", "About"),
              S.divider(),
              S.documentTypeListItem("policyPage").title("Policy pages"),
            ]),
        ),
      S.listItem()
        .title("Homepage sections")
        .child(
          S.list()
            .title("Homepage sections")
            .items([
              S.documentTypeListItem("howItWorksStep").title("How-it-works steps"),
              S.documentTypeListItem("valueProp").title("Why choose us"),
              S.documentTypeListItem("brand").title("Brands"),
              S.documentTypeListItem("testimonial").title("Testimonials"),
              S.documentTypeListItem("teamMember").title("Team"),
            ]),
        ),
      S.divider(),
      singleton(S, "siteSettings", "Site settings"),
      S.listItem()
        .title("Developer")
        .child(
          S.list()
            .title("Developer")
            .items([
              S.documentTypeListItem("formSubmission").title("Form submissions"),
              S.documentTypeListItem("shopCollectionConfig").title("Shop categories (editorial)"),
              singleton(S, "llmsDocument", "llms.txt"),
            ]),
        ),
    ]);
