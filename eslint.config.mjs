// ESLint flat config. Enforces docs/CODE_REVIEW.md rules where they are machine-checkable.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

/** Rule 4: animation/3D libraries only inside these folders. */
const MOTION_DIRS = ["components/motion/**", "components/3d/**", "components/rive/**", "lib/motion/**"];
const ANIMATION_PATTERNS = [
  {
    // regex (not gitignore-style `group`) so "motion/*" does not also match "@/components/motion/*"
    // (the sanctioned motion primitives). Motion & 3D Engineer, see docs/motion/HOOKS.md.
    regex: "^(gsap|@gsap/[^/]+|lenis|framer-motion|motion)(/.*)?$",
    message: "Animation libraries may only be imported in components/motion, components/3d, components/rive or lib/motion. Use the exported motion primitives (docs/CONTRACT_MOTION.md).",
  },
  {
    group: ["three", "three/*", "@react-three/*", "@splinetool/*", "@rive-app/*"],
    message: "3D / Spline / Rive may only be imported in components/3d or components/rive, and must be loaded via next/dynamic + Suspense.",
  },
];
/** Rule 5: GROQ only in lib/sanity. */
const GROQ_PATHS = [
  { name: "groq", message: "GROQ lives only in lib/sanity/queries.ts." },
  { name: "next-sanity", importNames: ["groq", "defineQuery"], message: "GROQ lives only in lib/sanity/queries.ts." },
];

/**
 * Rule 6 (layer boundaries): components are presentational. They receive data as props and may import
 * *types* from lib/sanity and lib/shop, never data/secret modules (fetchers, adapters, env.server,
 * form delivery) and never anything from app/. Runtime guard: those modules also import "server-only".
 */
const BOUNDARY_PATTERNS = [
  {
    group: ["@/lib/sanity/*", "!@/lib/sanity/types", "!@/lib/sanity/image", "@/lib/shop", "@/lib/shop/*", "!@/lib/shop/types", "!@/lib/shop/config", "@/lib/env.server", "@/lib/forms/submit", "@/lib/forms/spam"],
    allowTypeImports: true,
    message: "Layer boundary: components get data via props. Fetch in app/ (Server Components) through lib/sanity/content or lib/shop. Type-only imports are fine. See docs/CODE_REVIEW.md rule 6.",
  },
  { group: ["@/app/*", "@/app"], message: "Layer boundary: nothing outside app/ imports from app/." },
];
const LIB_BOUNDARY = [{ group: ["@/app/*", "@/app", "@/components/*"], message: "Layer boundary: lib/ must not import app/ or components/." }];

const SYNTAX_RULES = [
  {
    selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > :not(CallExpression[callee.name='cssVars'])",
    message: "No inline style props. Use Tailwind classes, or style={cssVars({...})} for dynamic CSS custom properties (lib/utils/css-vars.ts).",
  },
  {
    selector: "CallExpression[callee.name='useEffect'] CallExpression[callee.name='fetch']",
    message: "No data fetching in useEffect. Fetch in Server Components via lib/sanity/content.ts or lib/shop; mutate via server actions / route handlers.",
  },
];

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
      ".lighthouseci/**",
      // Vendored third-party source, see components/motion/reactbits/README.md
      "components/motion/reactbits/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-restricted-imports": ["error", { paths: GROQ_PATHS, patterns: ANIMATION_PATTERNS }],
      "no-restricted-syntax": ["error", ...SYNTAX_RULES],
      "react/jsx-no-target-blank": "error",
      "@next/next/no-img-element": "error",
    },
  },
  {
    files: ["components/**"],
    rules: { "no-restricted-imports": ["error", { paths: GROQ_PATHS, patterns: [...ANIMATION_PATTERNS, ...BOUNDARY_PATTERNS] }] },
  },
  {
    files: ["lib/**"],
    ignores: ["lib/motion/**"],
    rules: { "no-restricted-imports": ["error", { paths: GROQ_PATHS, patterns: [...ANIMATION_PATTERNS, ...LIB_BOUNDARY] }] },
  },
  {
    // Motion layer (owned by the Motion & 3D lane): may import animation libs, and may set
    // transform/opacity inline styles for animation state. Data-fetch rule still applies.
    files: MOTION_DIRS,
    rules: {
      "no-restricted-imports": ["error", { paths: GROQ_PATHS, patterns: BOUNDARY_PATTERNS }],
      "no-restricted-syntax": ["error", SYNTAX_RULES[1]],
    },
  },
  {
    files: ["lib/sanity/**", "sanity/**", "sanity.config.ts", "app/studio/**"],
    rules: { "no-restricted-imports": ["error", { patterns: [...ANIMATION_PATTERNS, ...LIB_BOUNDARY] }] },
  },
  {
    // Node scripts / config files
    files: ["scripts/**/*.mjs", "*.config.*"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
];

export default config;
