import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/export-pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/export-feasibility-pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "/api/export-validation-pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
};

export default nextConfig;
