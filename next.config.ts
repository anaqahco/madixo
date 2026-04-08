import type { NextConfig } from "next";

const nextConfig = {
  outputFileTracingIncludes: {
    "/api/export-pdf": [
      "./node_modules/playwright-core/.local-browsers/**/*",
    ],
    "/api/export-feasibility-pdf": [
      "./node_modules/playwright-core/.local-browsers/**/*",
    ],
    "/api/export-validation-pdf": [
      "./node_modules/playwright-core/.local-browsers/**/*",
    ],
  },
} satisfies NextConfig;

export default nextConfig;
