// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

import tailwindcss from '@tailwindcss/vite';

import Font from 'vite-plugin-font';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],

  vite: {
    plugins: [
      tailwindcss(),
      Font.vite({
        scanFiles: ['src/**/*.{vue,ts,tsx,js,jsx,astro,html}'],
      }),
    ]
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  })
});