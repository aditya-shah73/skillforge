// Backwards-compat shim. The AI course used to live here as the only course;
// it now lives in lib/courses/ai.ts. Existing module pages import from this
// path — re-exporting keeps them working until they're migrated.
//
// New code should import from "@/lib/courses/ai" (or whichever course) directly.

export { MODULES, PHASES, getModuleBySlug, type Module } from "./courses/ai";
