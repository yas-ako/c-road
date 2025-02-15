// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true },
  devtools: { enabled: false },

  vue: {
    propsDestructure: true,
  },

  srcDir: "src",
  modules: ["@nuxtjs/tailwindcss"],
  ssr: false,

  typescript: {
    typeCheck: true,
  },

  compatibilityDate: "2025-02-15",
});
