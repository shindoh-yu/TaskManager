<template>
  <v-container fluid>
    <div class="mt-10">
      <v-row justify="center" align="center">
        <v-col cols="auto">
          <v-icon icon="mdi-calendar-check" size="200"></v-icon>
        </v-col>
        <v-col cols="auto">
          <div class="text-h2 mb-3">Task Manager</div>
          <div class="text-subtitle-1 text-secondary">
            シンプルにタスクを管理しよう。
          </div>
        </v-col>
      </v-row>
      <v-row justify="center" align="center" class="mt-10">
        <v-col cols="auto">
          <div class="font-weight-bold">ようこそTaskManagerへ！</div>
          <div class="font-weight-normal text-secondary">
            ここでは、あなたのタスクや勉強時間、目標等を総合的に管理することができます。
          </div>
        </v-col>
      </v-row>
      <v-row justify="center" align="center" class="mt-10">
        <v-col cols="auto">
          <div class="font-weight-bold">TODOリスト</div>
          <div class="font-weight-normal text-secondary">
            タスクの追加、編集、削除、完了が行えます。<br />
            シンプルで美しいデザインが、タスク管理を楽しくします。
          </div>
        </v-col>
        <v-col cols="auto">
          <v-img
            :width="800"
            aspect-ratio="16/9"
            cover
            src="https://dl.dropboxusercontent.com/scl/fi/1lzw3qydtmaqkfzyvw477/2024-07-03-233948.png?rlkey=qan4dhwqo482wnzza9wq43pi6&st=qg1hhc1s"
          ></v-img>
        </v-col>
      </v-row>
      <v-row class="mt-10"></v-row>
      <v-row class="mt-10"></v-row>
      <v-row class="mt-10"></v-row>
      <v-row justify="center" align="center" class="mt-10">
        <v-col cols="auto">
          <div class="text-h4">アーキテクチャ</div>
        </v-col>
      </v-row>
      <v-row justify="center" align="center">
        <v-col cols="auto">
          <v-img
            :width="1000"
            aspect-ratio="16/9"
            cover
            src="https://dl.dropboxusercontent.com/scl/fi/3l3htj7ljc04ui16yb1gc/.png?rlkey=wmk10bp4f0n4vcio72b00e87p&st=r7t4sk75"
          ></v-img>
        </v-col>
      </v-row>
      <v-row class="mt-10"></v-row>
      <v-row class="mt-10"></v-row>
      <v-row class="mt-10"></v-row>
      <v-row justify="center" align="center" class="mt-10">
        <v-col cols="auto">
          <div class="text-h4">使用技術・言語</div>
        </v-col>
      </v-row>
      <v-row justify="center" align="center">
        <v-col cols="auto">
          <v-card width="300px">
            <v-card-title>フロントエンド</v-card-title>
            <v-card-text>
              【OS】<br />Amazon Linux2<br /><br />
              【サーバー】<br />Apache<br /><br />
              【フレームワーク】<br />
              Nuxt3.12.2<br />
              Vuetify3.5.1<br />
              Bootstrap5.3.3<br /><br />
              【言語】<br />
              TypeScript
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="auto">
          <v-card width="300px">
            <v-card-title>バックエンド</v-card-title>
            <v-card-text>
              【OS】<br />Amazon Linux2<br /><br />
              【サーバー】<br />Node.js<br /><br />
              【言語】<br />
              JavaScript
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row class="mt-10"></v-row>
      <v-row class="mt-10"></v-row>
      <v-row class="mt-10"></v-row>
      <v-row justify="center" align="center" class="mt-10">
        <v-col cols="auto">
          <div class="text-h4">今後の予定</div>
        </v-col>
      </v-row>
      <v-row justify="center" align="center">
        <v-col cols="6">
          <v-timeline align="start">
            <v-timeline-item
              v-for="(year, i) in years"
              :key="i"
              :dot-color="year.color"
              size="small"
            >
              <template v-slot:opposite>
                <div
                  :class="`pt-1 headline font-weight-bold text-${year.color}`"
                  v-text="year.year"
                ></div>
              </template>
              <div>
                <h2
                  :class="`mt-n1 headline font-weight-light mb-4 text-${year.color}`"
                >
                  {{ year.header }}
                </h2>
                <div>
                  {{ year.text }}
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const years = [
  {
    color: "cyan",
    year: "ver1.0.0",
    header: "Todoリスト",
    text: "タスクの追加、編集、削除、完了を簡単に行えます。",
  },
  {
    color: "green",
    year: "ver1.1.0",
    header: "勉強時間記録（Study）",
    text: "毎日の勉強時間を記録し、進捗を確認できます。",
  },
  {
    color: "pink",
    year: "ver1.2.0",
    header: "月間目標（Monthly Goals）",
    text: "毎月の目標を設定し、その達成状況を管理できます。",
  },
  {
    color: "amber",
    year: "ver1.3.0",
    header: "総合履歴リスト（History）",
    text: "過去のタスクや目標の履歴を閲覧できます。",
  },
  {
    color: "orange",
    year: "ver1.4.0",
    header: "ログイン機能",
    text: "ユーザーごとに個別のアカウントでログインし、データを管理できます。",
  },
];
</script>

<style scoped>
/* Your style content here */
</style>
