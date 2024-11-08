// https://nuxt.com/docs/api/configuration/nuxt-config

import path from 'path'
import fs from 'fs'

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: Boolean(process.env.NUXT_SSR),
  app: {
    head: {
      link: [],
    },
  },
  modules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/style-resources',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    'nuxt-icons',
  ],

  devServer: {
    https: {

    },
    host: process.env.NITRO_HOST,
    port: Number(process.env.NITRO_PORT) || 3000,
  },
  runtimeConfig: {
    // Public keys that are exposed to the client
    public: {
      // Base
      BASE_URL: process.env.BASE_URL,
      // REST
      REST_BASE_PROXY: !!process.env.REST_BASE_PROXY,
      REST_BASE_TARGET: process.env.REST_BASE_TARGET,
      REST_BASE_PATH: process.env.REST_BASE_PATH,
      REST_BASE_TOKEN: process.env.REST_BASE_TOKEN,
      REST_BASE_TOKEN_STORAGE_NAME: process.env.REST_BASE_TOKEN_STORAGE_NAME,
      // Api for use in project
      API_ENDPOINT: process.env.REST_BASE_PROXY ? `${process.env.BASE_URL}/proxy${process.env.REST_BASE_PATH}` : process.env.NUXT_PROXY_OPTIONS_TARGET,
      WS_ENDPOINT: process.env.WS_BASE_PROXY ? `${process.env.BASE_URL}/ws${process.env.WS_BASE_PATH}` : process.env.NUXT_WS_PROXY_OPTIONS_TARGET,
      // Debug
      APP_DEBUG: !!process.env.APP_DEBUG,
      APP_IS_PROD: !!process.env.APP_IS_PROD,
    },
  },
  routeRules: {
    '/assets/**': { cache: { maxAge: 60 * 60 * 24 * 30, staleMaxAge: 60 * 60 * 24 * 30 } },
    '/_nuxt/assets/**': {
      cache: { maxAge: 60 * 60 * 24 * 30, staleMaxAge: 60 * 60 * 24 * 30 },
    },
    '/proxy/api/**': { proxy: { to: `${process.env.REST_BASE_TARGET}${process.env.REST_BASE_PATH}/**` } },
    '/ws/v3/**': { proxy: { to: `${process.env.WS_BASE_TARGET}${process.env.WS_BASE_PATH}/**` } },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/utils/_colors.scss";@import "@/assets/styles/utils/_fontsizes.scss";',
        },
      },
    },
    server: {
      headers: {
        'Cache-Control': 'max-age=31536000',
      },
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'server.crt')),
      },
    },
  },
  nitro: {
    routeRules: {
      "/assets/**": { headers: { 'cache-control': `public,max-age=${365 * 24 * 60 * 60},s-maxage=${365 * 24 * 60 * 60}` } },
      "/_nuxt/**": { headers: { 'cache-control': `public,max-age=${365 * 24 * 60 * 60},s-maxage=${365 * 24 * 60 * 60}` } },
    },
  },
  styleResources: {
    scss: [
      '~/assets/styles/utils/_colors.scss',
      '~/assets/styles/utils/_fontsizes.scss',
    ],
  },
  css: [
    '~/assets/fonts/Jura/stylesheet.css',
    '~/assets/styles/main.scss',
  ],
})
