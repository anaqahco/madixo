import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/export-pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./public/fonts/**/*",
      "./public/brand/**/*",
    ],
    "/api/export-feasibility-pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./public/fonts/**/*",
      "./public/brand/**/*",
    ],
    "/api/export-validation-pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./public/fonts/**/*",
      "./public/brand/**/*",
    ],
  },
};

export default nextConfig;
