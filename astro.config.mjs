import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://peteryangclaw.cc',
  output: 'static',
  integrations: [sitemap(), pagefind()],
  adapter: vercel({
    // Umami handles analytics; inline Vercel Insights hurts Lighthouse on static HTML.
    webAnalytics: {
      enabled: false,
    },
  }),
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: true
    }
  }
});
