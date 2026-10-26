"use client";

/**
 * Sanity Studio config, embedded at /studio (app/studio/[[...tool]]/page.tsx).
 * Schema, desk structure and Presentation mapping are VENDORED from ../cms (the CMS Engineer's frozen
 * SCHEMA_CONTRACT, the source of truth). Re-sync them with `pnpm sync:cms`; never edit them here.
 * Mirrors cms/sanity.config.ts, adapted for embedding (basePath, NEXT_PUBLIC_ env, same-origin preview).
 * Shop source: SANITY_STUDIO_SHOP_SOURCE defaults to "shopify" (ARCHITECTURE D1), so `product` is not registered.
 * Without NEXT_PUBLIC_SANITY_PROJECT_ID the Studio route renders a "not configured" notice instead.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { resolve } from "./sanity/presentation";
import { structure } from "./sanity/structure";
import { schemaTypes, SINGLETON_IDS } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "not-configured";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01";

const singletons = new Set<string>(SINGLETON_IDS);
const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);
/** Created only by the site's server routes, never by editors. */
const NO_CREATE = new Set<string>([...SINGLETON_IDS, "formSubmission"]);

export default defineConfig({
  name: "speedy-irepair",
  title: "Speedy iRepair",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable", disable: "/api/draft-mode/disable" } },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !NO_CREATE.has(schemaType)),
  },
  document: {
    actions: (input, { schemaType }) => {
      if (singletons.has(schemaType)) return input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action));
      if (schemaType === "formSubmission") return input.filter(({ action }) => action !== "duplicate");
      return input;
    },
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global" ? prev.filter((t) => !NO_CREATE.has(t.templateId)) : prev,
  },
});
