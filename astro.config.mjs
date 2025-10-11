// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import Font from 'vite-plugin-font';
import Gueleton from 'unplugin-gueleton/vite'

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [vue({ appEntrypoint: '/src/lib/vue-app.ts' })],

  vite: {
    plugins: [
      tailwindcss(),
      Font.vite({
        scanFiles: ['src/**/*.{vue,ts,tsx,js,jsx,astro,html}'],
      }),
      Gueleton(),
    ]
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  })
});