import type { NextConfig } from "next";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(path.join(process.cwd(), "../.."));

const basePath = process.env.BASE_PATH ?? "/platform";

const nextConfig: NextConfig = {
  basePath,
  transpilePackages: ["@afterhive/api", "@afterhive/shared", "@afterhive/ui", "@afterhive/domain", "@afterhive/db"],
  output: "standalone",
};

export default nextConfig;
