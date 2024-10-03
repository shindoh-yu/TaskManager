import { Auth } from "aws-amplify";
import { useRouter } from "vue-router";

export default defineNuxtRouteMiddleware(async () => {
  const router = useRouter();

  try {
    await Auth.currentAuthenticatedUser();
  } catch (error) {
    // ユーザーが認証されていない場合、ログインページへリダイレクト
    console.log(error);
    return router.push("/login");
  }
});
