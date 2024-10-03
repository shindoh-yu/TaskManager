<template>
  <div>
    <v-card class="mx-auto mt-10" max-width="448" title="User Registration">
      <v-container>
        <v-text-field
          v-model="username"
          color="primary"
          label="First name"
          variant="underlined"
        ></v-text-field>

        <v-text-field
          v-model="email"
          color="primary"
          label="Email"
          variant="underlined"
        ></v-text-field>

        <v-text-field
          v-model="password"
          color="primary"
          label="Password"
          placeholder="Enter your password"
          variant="underlined"
        ></v-text-field>

        <v-checkbox
          v-model="terms"
          color="secondary"
          label="I agree to site terms and conditions"
        ></v-checkbox>
      </v-container>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn color="success">
          Complete Registration

          <v-icon icon="mdi-chevron-right" end></v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { Auth } from "aws-amplify";

import { ref, onMounted } from "vue";
const username = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const terms = ref<boolean>(false);

async function signUp() {
  try {
    await Auth.signUp({
      username: username.value,
      password: password.value,
      attributes: {
        email: email.value,
      },
    });
    console.log("Sign up successful");
  } catch (error) {
    console.error("Error signing up:", error);
  }
}
</script>

<style scoped>
/* Your style content here */
</style>
