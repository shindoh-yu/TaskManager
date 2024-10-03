<template>
  <v-layout ref="app" class="rounded rounded-md">
    <v-app-bar
      color="grey-lighten-2"
      name="app-bar"
      title="Task Manager Ver.1.0.0"
    >
    </v-app-bar>

    <v-navigation-drawer name="drawer" permanent>
      <v-list>
        <v-list-item-group>
          <v-list-item
            v-for="(item, i) in topMenu"
            :key="i"
            :title="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
          >
          </v-list-item>
        </v-list-item-group>
        <v-list-subheader>Functions</v-list-subheader>
        <v-list-item-group>
          <v-list-item
            v-for="(item, i) in mainMenu"
            :key="i"
            :title="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
          >
          </v-list-item>
        </v-list-item-group>
        <v-list-subheader>Links</v-list-subheader>
        <v-list-item-group>
          <v-list-item
            v-for="(item, i) in otherMenu"
            :key="i"
            :title="item.title"
            :href="item.to"
            :prepend-icon="item.icon"
          >
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main
      class="d-flex align-center justify-center"
      style="min-height: 300px"
    >
      <slot />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
const order = ref(-1);
const topMenu = [
  {
    icon: "mdi-apps",
    title: "Top",
    to: "/",
  },
];
const mainMenu = [
  {
    icon: "mdi-flag-checkered",
    title: "Monthly Goals",
    to: "",
  },
  {
    icon: "mdi-checkbox-marked-circle-auto-outline",
    title: "Todo",
    to: "todo",
  },
  {
    icon: "mdi-lead-pencil",
    title: "Study",
    to: "",
  },
  {
    icon: "mdi-history",
    title: "History",
    to: "history",
  },
];
const otherMenu = [
  {
    icon: "mdi-github",
    title: "Github",
    to: "https://github.com/shindoh-yu/TaskManager",
  },
];
const links = ["Home", "About Us"];
</script>

<style scoped>
.nav-link {
  text-decoration: none;
  color: inherit;
}
</style>
