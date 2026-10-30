// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves this repo under /portfolio. Cloudflare Pages, Vercel or a custom domain
// serve it from the root, so leave BASE_PATH unset there.
const base = process.env.BASE_PATH || "/";
const site = process.env.SITE_URL || "https://jayswansocool48.github.io";

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "ignore",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
});
