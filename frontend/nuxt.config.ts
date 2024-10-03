import { defineNuxtConfig } from "nuxt/config";
import vuetify from "vite-plugin-vuetify";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  build: {
    transpile: ["vuetify"],
  },
  hooks: {
    "vite:extendConfig": (config) => {
      config.plugins!.push(vuetify());
    },
  },
  vite: {
    ssr: {
      noExternal: ["vuetify"],
    },
    define: {
      "process.env.DEBUG": false,
      "window.global": {},
    },
  },
  css: [
    "@/assets/main.scss",
    "vuetify/styles",
    "bootstrap/dist/css/bootstrap.min.css",
  ],
  runtimeConfig: {
    public: {
      s3DataKey: process.env.S3_DATA_KEY,
      awsRegion: process.env.AWS_REGION,
      userPoolId: process.env.USER_POOL_ID,
      userPoolWebClientId: process.env.USER_POOL_WEB_CLIENT_ID,
      cognitoDomainPrefix: process.env.COGNITO_DOMAIN_PREFIX,
      appBaseUrl: process.env.APP_BASE_URL,
    },
  },
  plugins: [{ src: "~/plugins/aws-amplify.ts", mode: "client" }],
});
