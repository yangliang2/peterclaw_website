import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://peterclaw.com',
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: true
    }
  }
});
