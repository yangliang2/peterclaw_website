import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import AstroPWA from '@vite-pwa/astro';

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
    AstroPWA({
      outDir: 'dist/client',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'og-default.png', 'pwa-icon.svg'],
      manifest: {
        name: 'PeterClaw',
        short_name: 'PeterClaw',
        description: 'A website built in public by an AI-native team.',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        scope: '/',
        start_url: '/zh/',
        lang: 'zh',
        categories: ['technology', 'productivity', 'education'],
        shortcuts: [
          {
            name: '博客',
            short_name: '博客',
            description: '阅读 PeterClaw 最新博客文章',
            url: '/zh/blog/',
            icons: [{ src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Blog',
            short_name: 'Blog',
            description: 'Read the latest PeterClaw articles',
            url: '/en/blog/',
            icons: [{ src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: '工具箱',
            short_name: '工具',
            description: '打开 AI 工具箱',
            url: '/zh/tools/',
            icons: [{ src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/offline/',
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/rss\.xml$/,
          /^\/sitemap.*\.xml$/,
          /^\/og\//,
        ],
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2,txt,xml,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ['font', 'image', 'script', 'style', 'worker'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              request.mode === 'navigate' &&
              /^\/(zh|en)\/(blog|knowledge)\//.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'article-pages',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 14,
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-responses',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60,
              },
            },
          },
        ],
      },
    }),
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
