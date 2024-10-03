import { Amplify } from "aws-amplify";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const region = config.public.awsRegion;
  const userPoolId = config.public.userPoolId;
  const userPoolWebClientId = config.public.userPoolWebClientId;
  const cognitoDomainPrefix = config.public.cognitoDomainPrefix;
  const appBaseUrl = config.public.appBaseUrl;

  const amplifyConfig = {
    Auth: {
      region,
      userPoolId,
      userPoolWebClientId,
      mandatorySignIn: true,
      oauth: {
        domain: `${cognitoDomainPrefix}.auth.${region}.amazoncognito.com`,
        scope: ["openid"],
        redirectSignIn: appBaseUrl,
        redirectSignOut: appBaseUrl,
        responseType: "code",
      },
    },
  };

  Amplify.configure(amplifyConfig);
});
