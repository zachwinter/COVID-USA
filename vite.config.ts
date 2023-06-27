import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Pages from 'vite-plugin-pages';
import VuePlugin from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import SVG from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VuePlugin(),

    SVG(),

    AutoImport({
      imports: ['vue', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      dirs: [
        'src/components',
        'src/store',
        'src/hooks',
        'src/interfaces',
        'src/types',
        'src/enums',
      ],
      include: [/\.ts?$/, /\.vue\??/],
      vueTemplate: true,
    }),

    Components({
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
      dts: 'src/components.d.ts',
    }),

    Pages(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use './src/styles/imports.scss' as *;
          @import './src/styles/functions/units.scss';
          @import './src/styles/functions/spacer.scss';
        `,
      },
    },
  },

  server: {
    proxy: {
      '/api': 'http://localhost:3333'
    }
  }
});
