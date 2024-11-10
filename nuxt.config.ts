// https://nuxt.com/docs/api/configuration/nuxt-config

import glsl from "vite-plugin-glsl";
export default defineNuxtConfig({
  routeRules: {
    "/_nuxt/**": { headers: { "cache-control": "s-maxage=86400" } },
    // '/home': { redirect: {to: '/' , statusCode: 301 } },
  },

  modules: [
    "@nuxt/content",
    ["@nuxt-modules/compression", { algorithm: "brotliCompress" }],
    "@nuxt/image",
    "nuxt-viewport",
  ],

  build: {
    transpile: ["gsap"],
  },

  vite: {
    plugins: [glsl()],
    css: {
      preprocessorOptions: {
        scss: {
          extractCSS: false,
        },
      },
    },
  },

  hooks: {
    "build:manifest": (manifest) => {
      // find the app entry, css list
      const css = manifest["node_modules/nuxt/dist/app/entry.js"]?.css;
      if (css) {
        // start from the end of the array and go to the beginning
        for (let i = css.length - 1; i >= 0; i--) {
          // if it starts with 'entry', remove it from the list
          if (css[i].startsWith("entry")) css.splice(i, 1);
        }
      }
    },
  },

  // app: {
  //     pageTransition: { name: 'page', mode: 'out-in' }
  // },
  nitro: {
    compressPublicAssets: true,
  },

  compatibilityDate: "2024-11-10",
});

// module.exports = {
//     buildModules: ['nuxt-compress'],
// };

// serverMiddleware: [
//     { path: '/api/send-email', handler: '~/api/send-email.js' }
// ],