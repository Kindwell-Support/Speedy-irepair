import { evaluate, parse, type ExprNode } from "groq-js";
import type { QueryParams } from "next-sanity";
import dataset from "./fixtures/dataset.json";

/**
 * FIXTURE MODE (SCHEMA_CONTRACT v1.2 §5.4). When NEXT_PUBLIC_SANITY_PROJECT_ID is unset, the exact GROQ in
 * queries.ts (and sanity/lib/seoQueries.ts) runs locally with groq-js over the committed seed
 * (fixtures/dataset.json, built by `pnpm fixture:build` from sanity/seed/seed.ndjson). Same queries, same
 * projections, same documents `sanity dataset import` would load: one mechanism, not a second content path.
 * Hand-written fixtures in fixtures/*.ts only back-fill view-model fields the seed does not carry (mergeFallback).
 * Published perspective only: draft mode is a no-op here (no drafts in the seed).
 */
const DOCS: unknown[] = dataset;

// Parse once per query string, WITHOUT params (param values would otherwise be folded into the cached tree).
const trees = new Map<string, ExprNode>();

export async function fixtureFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  let tree = trees.get(query);
  if (!tree) {
    tree = parse(query);
    trees.set(query, tree);
  }
  const value = await evaluate(tree, { dataset: DOCS, params });
  return (await value.get()) as T;
}

export const FIXTURE_DOC_COUNT = DOCS.length;
