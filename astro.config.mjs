import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "https://peterclaw.com";

export default defineConfig({
  site,
  trailingSlash: "always",
  integrations: [sitemap()],
});
