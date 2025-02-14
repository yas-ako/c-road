// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true },
  devtools: { enabled: false },
  srcDir: "src",
  modules: ["@nuxtjs/tailwindcss"],
  ssr: false,
  typescript: {
    typeCheck: true,
  },
});
