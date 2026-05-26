import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

/** Keep only locale-prefixed routes; exclude root/meta refresh stubs. */
function isLocalePrefixedPage(page) {
  const path = new URL(page).pathname;
  return /^\/(zh|en)(\/|$)/.test(path);
}

export default defineConfig({
  site: 'https://peterclaw-website.vercel.app',
  output: 'static',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  integrations: [
    sitemap({
      filter: isLocalePrefixedPage,
      i18n: {
        defaultLocale: 'zh',
        locales: {
          zh: 'zh',
          en: 'en',
        },
      },
    }),
    pagefind(),
  ],
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
