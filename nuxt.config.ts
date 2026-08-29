// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  srcDir: "src",
  modules: ["@nuxt/eslint", "@pinia/nuxt"],
  ssr: false,

  css: ["~/assets/css/tailwind.css"],

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },

  typescript: {
    typeCheck: true,
  },

  compatibilityDate: "2025-02-15",
});
