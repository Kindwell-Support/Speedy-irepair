"use client";

/**
 * Sanity Studio config, embedded at /studio (app/studio/[[...tool]]/page.tsx).
 * Without NEXT_PUBLIC_SANITY_PROJECT_ID the Studio route renders a "not configured" notice instead.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { resolve } from "./sanity/preview/resolve";
import { structure } from "./sanity/desk/structure";
import { schemaTypes, SINGLETON_TYPES } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "not-configured";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-01";
const singletons = new Set<string>(SINGLETON_TYPES);

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
    // Singletons can't be created from the "new document" menu.
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.has(schemaType)),
  },
  document: {
    // Singletons: no duplicate/delete/unpublish.
    actions: (input, context) =>
      singletons.has(context.schemaType)
        ? input.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : input,
  },
});
