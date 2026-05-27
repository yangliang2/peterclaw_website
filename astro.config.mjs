import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

/** Keep only locale-prefixed routes; exclude root/meta refresh stubs. */
function isLocalePrefixedPage(page) {
  const path = new URL(page).pathname;
  return /^\/(zh|en)(\/|$)/.test(path);
}

function addImagePerformanceAttributes() {
  return (tree) => {
    function visit(node) {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'element' && node.tagName === 'img') {
        node.properties = {
          loading: 'lazy',
          decoding: 'async',
          ...node.properties,
        };
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    }

    visit(tree);
  };
}

export default defineConfig({
  site: 'https://peterclaw-website.vercel.app',
  output: 'static',
  markdown: {
    rehypePlugins: [addImagePerformanceAttributes],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  integrations: [
    mdx(),
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
