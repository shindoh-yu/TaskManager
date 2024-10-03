<template>
  <v-container fluid>
    <v-row v-show="isError">
      <v-col cols="4">
        <v-alert :text="errorStr" title="Error" type="error"></v-alert>
      </v-col>
    </v-row>

    <!-- ロード画面 -->
    <v-row v-show="loading">
      <v-col>
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
      <v-col>
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
      <v-col>
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
      <v-col>
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
      <v-col>
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
      <v-col>
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
    </v-row>

    <!-- snackbar -->
    <v-snackbar
      v-model="isUpdate"
      vertical
      timeout="2000"
      color="success"
      location="left"
    >
      <div class="text-subtitle-1 pb-2">Update Done</div>
      <span>The data update was processed successfully.</span>
      <template v-slot:actions>
        <v-btn variant="text" @click="isUpdate = false"> Close </v-btn>
      </template>
    </v-snackbar>

    <!-- 日付選択 -->
    <div v-show="!isError" class="mt-3">
      <v-row v-show="!loading" class="ml-11">
        <v-col cols="1">
          <v-select
            v-model="selectedYear"
            label="年"
            density="compact"
            :items="years"
            variant="outlined"
            @update:model-value="selectYearOrMonth()"
          ></v-select>
        </v-col>
        <v-col cols="1">
          <v-select
            v-model="selectedMonth"
            label="月"
            density="compact"
            :items="months"
            variant="outlined"
            @update:model-value="selectYearOrMonth()"
          ></v-select>
        </v-col>
        <!-- 通信表示 -->
        <v-col class="mt-1" v-show="isUpdating">
          <div>
            <v-progress-circular
              size="20"
              width="3"
              color="primary"
              indeterminate
            ></v-progress-circular>
            <span class="text-caption ml-3 text-secondary blinking"
              >通信中です</span
            >
          </div>
        </v-col>
        <v-col class="mt-1" v-show="!isUpdating">
          <div>
            <v-icon
              icon="mdi-check-circle"
              size="20"
              class="text-success"
            ></v-icon>
            <span class="text-caption ml-3 text-success"
              >最新の状態です。(最終更新：{{ getCurrentDateTime() }})</span
            >
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- TODOリスト -->
    <v-row justify="center" class="mt-0">
      <v-slide-group
        selected-class="bg-success"
        v-model="selected"
        center-active
        show-arrows
      >
        <v-slide-group-item v-for="(day, index1) in days" :key="index1">
          <v-card
            :style="{
              backgroundColor: day.date === getTodayDate() ? '#E3F2FD' : '',
            }"
            :isSelected="day.date === getTodayDate() ? true : false"
            class="flex-grow-1 ma-4"
            width="280"
          >
            <v-card-title
              v-if="convertDateToDay(day.date) === '土'"
              style="color: blue; font-weight: bold"
              >{{ formatDateString(day.date) }}</v-card-title
            >
            <v-card-title
              v-else-if="convertDateToDay(day.date) === '日'"
              style="color: red; font-weight: bold"
              >{{ formatDateString(day.date) }}</v-card-title
            >
            <v-card-title v-else style="font-weight: bold"
              >{{ formatDateString(day.date) }}
            </v-card-title>
            <v-card-subtitle v-if="mode === 'edit'">
              <v-text-field
                v-model="day.description"
                style="margin-right: 0px"
                variant="underlined"
                hide-details
              ></v-text-field>
            </v-card-subtitle>
            <v-card-subtitle v-else>{{ day.description }}</v-card-subtitle>
            <v-card-subtitle v-if="mode !== 'edit'" style="text-align: center">
              <v-progress-circular
                v-model="day.progress"
                rotate="360"
                size="80"
                width="11"
                color="teal"
              >
                {{ day.progress }} %
              </v-progress-circular>
            </v-card-subtitle>
            <v-card-text>
              <v-list
                :style="{
                  backgroundColor: day.date === getTodayDate() ? '' : '',
                }"
                dense
                class="rounded-list"
              >
                <v-icon
                  icon="mdi-white-balance-sunny"
                  style="
                    margin-left: 10px;
                    font-weight: bold;
                    color: gray;
                    margin-bottom: 5px;
                  "
                ></v-icon>
                <v-subheader
                  style="font-weight: bold; font-size: large; color: gray"
                >
                  午前
                </v-subheader>
                <v-card-item
                  v-for="task in getMorningTasks(day.tasks)"
                  :key="task.id"
                >
                  <v-row v-if="mode === 'edit'">
                    <v-col cols="10">
                      <v-text-field
                        v-model="task.name"
                        style="margin-right: 0px"
                        variant="underlined"
                        hide-details="auto"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="1">
                      <v-btn
                        variant="plain"
                        icon="mdi-delete-circle"
                        @click.stop="deleteTask(day, task.id)"
                      >
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-checkbox
                    v-else-if="mode === 'normal' && day.date <= getTodayDate()"
                    v-model="task.done"
                    :label="task.name"
                    density="compact"
                    hide-details="auto"
                    @change="calcProgress(day)"
                    @update:modelValue="updateDaysData('update', 'auto')"
                  />
                  <v-checkbox
                    v-else
                    v-model="task.done"
                    :label="task.name"
                    density="compact"
                    disabled
                    hide-details="auto"
                    @change="calcProgress(day)"
                  />
                </v-card-item>
                <v-card-actions v-if="mode === 'edit'">
                  <v-btn
                    style="
                      display: block;
                      margin-left: auto;
                      margin-right: auto;
                      color: gray;
                    "
                    icon
                    @click.stop="addTask(index1, '0')"
                  >
                    <v-icon size="x-large">mdi-plus-circle</v-icon>
                  </v-btn>
                </v-card-actions>
                <v-divider />
                <v-icon
                  icon="mdi-moon-waxing-crescent"
                  style="
                    margin-left: 10px;
                    font-weight: bold;
                    color: gray;
                    margin-bottom: 5px;
                  "
                ></v-icon>
                <v-subheader
                  style="font-weight: bold; font-size: large; color: gray"
                >
                  午後
                </v-subheader>
                <v-card-item
                  v-for="task in getAfternoonTasks(day.tasks)"
                  :key="task.id"
                >
                  <v-row v-if="mode === 'edit'">
                    <v-col cols="10">
                      <v-text-field
                        v-model="task.name"
                        style="margin-right: 0px"
                        variant="underlined"
                        hide-details="auto"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="1">
                      <v-btn
                        variant="plain"
                        icon="mdi-delete-circle"
                        @click.stop="deleteTask(day, task.id)"
                      >
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-checkbox
                    v-else-if="mode === 'normal' && day.date <= getTodayDate()"
                    v-model="task.done"
                    :label="task.name"
                    density="compact"
                    hide-details="auto"
                    @change="calcProgress(day)"
                    @update:modelValue="updateDaysData('update', 'auto')"
                  />
                  <v-checkbox
                    v-else
                    v-model="task.done"
                    :label="task.name"
                    density="compact"
                    hide-details="auto"
                    disabled
                    @change="calcProgress(day)"
                  />
                </v-card-item>
                <v-card-actions>
                  <v-btn
                    v-if="mode === 'edit'"
                    style="
                      display: block;
                      margin-left: auto;
                      margin-right: auto;
                      color: gray;
                    "
                    icon
                    @click.stop="addTask(index1, '1')"
                  >
                    <v-icon size="x-large">mdi-plus-circle</v-icon>
                  </v-btn>
                </v-card-actions>
                <v-list-item v-if="mode !== 'edit'">
                  <v-textarea
                    v-if="day.date <= getTodayDate()"
                    v-model="day.evaluation"
                    variant="outlined"
                    name="input-7-4"
                    label="一日の振り返り"
                  ></v-textarea>
                  <v-textarea
                    v-else
                    v-model="day.evaluation"
                    disabled
                    variant="outlined"
                    name="input-7-4"
                    label="一日の振り返り"
                  ></v-textarea>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-row>
    <v-footer name="footer" class="bg-grey-lighten-3" app height="60">
      <v-row style="padding-left: 8px" no-gutters>
        <v-row>
          <v-btn style="margin-left: 10px" @click="modeChange()">
            {{ mode === "edit" ? "Done" : "Edit" }}
          </v-btn>
          <v-btn
            v-if="mode === 'normal'"
            style="margin-left: 10px"
            @click="updateDaysData('update', 'button')"
          >
            {{ "UPDATE" }}
          </v-btn>
        </v-row>
      </v-row>
    </v-footer>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { useRuntimeConfig } from "#app";

// definePageMeta({
//   middleware: ["authenticated"],
// });

/**
 * クラス：Task
 */
class Task {
  id: number;
  name: string;
  time: string;
  done: boolean;
  constructor(id: number, name: string, time: string, done: boolean) {
    this.id = id;
    this.name = name;
    this.time = time;
    this.done = done;
  }
}

/**
 * クラス：Day
 */
class Day {
  date: string;
  description: string;
  evaluation: string;
  tasks: Task[];
  progress: number;
  constructor(
    date: string,
    description: string,
    evaluation: string,
    tasks: Task[]
  ) {
    this.date = date;
    this.description = description;
    this.evaluation = evaluation;
    this.tasks = tasks.map(
      (task) => new Task(task.id, task.name, task.time, task.done)
    );
    this.progress = this.calculateProgress();
  }

  calculateProgress(): number {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter((task) => task.done).length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }
}

const days = ref<Day[]>([]); // Days
const years = ref<string[]>(["2024", "2025", "2026", "2027", "2028"]);
const months = ref<string[]>([
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
]);
const selectedYear: Ref<string> = ref(getCurrentYear()); // 選択されている年（検索条件）
const selectedMonth: Ref<string> = ref(getCurrentMonth()); // 選択されている月（検索条件）
const mode: Ref<string> = ref("normal"); // 通常OR編集のモード切替
const isUpdate: Ref<boolean> = ref(false); // 更新が完了したかどうか
const isUpdating: Ref<boolean> = ref(false); // 更新中かどうか
const loading: Ref<boolean> = ref(true); // S3からデータを取得できたかどうか
const isError: Ref<boolean> = ref(false); // 3S空データ取得時にエラーが発生したかどうか
const errorStr: Ref<string> = ref(""); // エラーメッセージ
const selected: Ref<number> = ref(getTodayDateNumber() - 1); // 初期表示の際中央表示される日付
const userName: string = "rokiseth"; // ログインしているユーザ

// AWS 環境変数のロード
const config = useRuntimeConfig();
// const bucketName = config.public.s3BucketName || "";
const dataKey = config.public.s3DataKey || "";
// const region = config.public.awsRegion || "";
// const accessKeyId = config.public.awsAccessKeyId || "";
// const secretAccessKey = config.public.awsSecretAccessKey || "";

// AWS SDKの設定
// const s3Client = new S3Client({
//   region: region,
//   credentials: {
//     accessKeyId: accessKeyId,
//     secretAccessKey: secretAccessKey,
//   },
// });

// AWS SDKの設定
// const s3Client = new S3Client({
//   region: region,
// });

// ヘルパー関数: Readableストリームを文字列に変換
function streamToString(stream: ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    const pump = () => {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            // Uint8Array の配列を結合する
            const combinedChunks = new Uint8Array(
              chunks.reduce((acc, chunk) => acc + chunk.length, 0)
            );
            let offset = 0;
            for (const chunk of chunks) {
              combinedChunks.set(chunk, offset);
              offset += chunk.length;
            }
            resolve(new TextDecoder("utf-8").decode(combinedChunks));
            return;
          }
          chunks.push(value);
          pump();
        })
        .catch(reject);
    };
    pump();
  });
}

async function fetchDaysData() {
  try {
    // フォルダとファイルを作成
    const fileCreated = await createFileIfNotExists(
      userName + "/" + selectedYear.value + selectedMonth.value + "/" + dataKey
    );

    if (fileCreated) {
      console.log("New file created, skipping fetch.");
      days.value = [];
      generateDays(Number(selectedYear.value), Number(selectedMonth.value));
      updateDaysData("create", "auto");
      loading.value = false;
      return;
    }

    console.log("Fetching data from S3...");
    // const params = {
    //   Bucket: bucketName,
    //   Key:
    //     userName +
    //     "/" +
    //     selectedYear.value +
    //     selectedMonth.value +
    //     "/" +
    //     dataKey,
    //   // キャッシュ無効化のためのヘッダー
    //   ResponseCacheControl: "no-cache",
    // };

    // const command = new GetObjectCommand(params);
    // const response = await s3Client.send(command);
    // const data = await streamToString(response.Body as ReadableStream);
    // console.log("Data fetched:", data);

    // if (!data) {
    //   console.error("No data found in the S3 object.");
    //   throw new Error("No data found in the S3 object.");
    // }

    // const jsonData = JSON.parse(data);
    // console.log("JSON data parsed:", jsonData);

    const requestBody = {
      userName: userName,
      selectedYear: selectedYear.value,
      selectedMonth: selectedMonth.value,
      dataKey: dataKey,
    };

    console.log(requestBody);

    try {
      const response = await fetch("https://rokiseth.net/api/fetchDaysData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const responseData = await response.json();
      if (response.ok) {
        days.value = responseData;
      } else {
        console.error("Error fetching data from API:", responseData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      isError.value = true;
      errorStr.value = String(error);
    }

    // days.value = jsonData;

    loading.value = false;
    console.log(days.value);
  } catch (error) {
    console.error("Error fetching data from S3:", error);

    isError.value = true;
    errorStr.value = String(error);
  }
}

async function updateDaysData(mode: string, type: string) {
  try {
    if (mode === "update") {
      isUpdating.value = true;
      // const initialDays = await fetchInitialDaysData();
      // const mergedDays = mergeDays(initialDays, days.value);
      // console.log("Merged data:", mergedDays);
      // const params = {
      //   Bucket: bucketName,
      //   Key:
      //     userName +
      //     "/" +
      //     selectedYear.value +
      //     selectedMonth.value +
      //     "/" +
      //     dataKey,
      //   Body: JSON.stringify(mergedDays),
      //   ContentType: "application/json",
      // };
      // const command = new PutObjectCommand(params);
      // await s3Client.send(command);
      try {
        const response = await fetch(
          "https://rokiseth.net/api/updateDaysData",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userName,
              selectedYear: selectedYear.value,
              selectedMonth: selectedMonth.value,
              dataKey,
              days: days.value,
            }),
          }
        );
        if (response.ok) {
          const result = await response.json();
          console.log("Upload success:", result);
          isUpdating.value = false;
          if (type === "button") {
            isUpdate.value = true;
          }
          return result;
        } else {
          const error = await response.json();
          console.error("Upload error:", error);
          isError.value = true;
          errorStr.value = String(error);
          return error;
        }
      } catch (error) {
        console.error("Fetch error:", error);
        isError.value = true;
        errorStr.value = String(error);
        return error;
      }
    } else if (mode === "create") {
      // const params = {
      //   Bucket: bucketName,
      //   Key:
      //     userName +
      //     "/" +
      //     selectedYear.value +
      //     selectedMonth.value +
      //     "/" +
      //     dataKey,
      //   Body: JSON.stringify(days.value),
      //   ContentType: "application/json",
      // };
      // const command = new PutObjectCommand(params);
      // await s3Client.send(command);
      try {
        const response = await fetch(
          "https://rokiseth.net/api/updateDaysData",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userName,
              selectedYear: selectedYear.value,
              selectedMonth: selectedMonth.value,
              dataKey,
              days: days.value,
            }),
          }
        );
        if (response.ok) {
          const result = await response.json();
          console.log("Upload success:", result);
          return result;
        } else {
          const error = await response.json();
          console.error("Upload error:", error);
          isError.value = true;
          errorStr.value = String(error);
          return error;
        }
      } catch (error) {
        console.error("Fetch error:", error);
        isError.value = true;
        errorStr.value = String(error);
        return error;
      }
      console.log("Data updated successfully");
    }
  } catch (error) {
    console.error("Error updating data to S3:", error);
    isError.value = true;
    errorStr.value = String(error);
  }
}

// async function fetchInitialDaysData(): Promise<Day[]> {
//   try {
//     console.log("Fetching initial data from S3...");
//     const params = {
//       Bucket: bucketName,
//       Key:
//         userName +
//         "/" +
//         selectedYear.value +
//         selectedMonth.value +
//         "/" +
//         dataKey,
//       // キャッシュ無効化のためのヘッダー
//       ResponseCacheControl: "no-cache",
//     };

//     const command = new GetObjectCommand(params);
//     const response = await s3Client.send(command);
//     if (!response.Body) {
//       throw new Error("No data found in S3 response.");
//     }
//     const responseBody = await streamToString(response.Body as ReadableStream);
//     const initialDays = JSON.parse(responseBody);
//     return initialDays.map(
//       (day: any) =>
//         new Day(day.date, day.description, day.evaluation, day.tasks)
//     );
//   } catch (error) {
//     console.error("Error fetching data from S3:", error);
//     isError.value = true;
//     errorStr.value = String(error);
//     return [];
//   }
// }

async function createFileIfNotExists(key: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://rokiseth.net/api/createFileIfNotExists",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("Success:", result);

      // fileCreatedの値を参照
      if (result.fileCreated) {
        console.log("File was created.");
        return result.fileCreated;
      } else {
        console.log("File already exists or an error occurred.");
        return result.fileCreated;
      }
    } else {
      const error = await response.json();
      console.error("Error:", error);
      return false;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return false;
  }
}

// async function createFileIfNotExists(
//   bucket: string,
//   key: string
// ): Promise<boolean> {
//   const fileKey = `${key}`;
//   const fileContent = JSON.stringify({ days: [] });

//   console.log(`Checking file: ${fileKey}`);

//   try {
//     const params = {
//       Bucket: bucket,
//       Key: fileKey,
//       // キャッシュ無効化のためのヘッダー
//       ResponseCacheControl: "no-cache",
//     };
//     const command = new GetObjectCommand(params);
//     const response = await s3Client.send(command);
//     console.log(response);
//     console.log(`File ${fileKey} already exists.`, response);
//     return false;
//   } catch (headError) {
//     if (headError instanceof Error) {
//       if (headError.name === "NoSuchKey") {
//         try {
//           await s3Client.send(
//             new PutObjectCommand({
//               Bucket: bucket,
//               Key: fileKey,
//               Body: fileContent,
//               ContentType: "application/json",
//             })
//           );
//           console.log(`File ${fileKey} created successfully.`);
//           days.value = [];
//           return true;
//         } catch (putError) {
//           console.error("Error creating file:", putError);
//           return false;
//         }
//       } else {
//         console.error("Error checking file existence:", headError);
//         return false;
//       }
//     } else {
//       console.error("Unknown error type:", headError);
//       return false;
//     }
//   }
// }

/**
 * 関数：Dayの日付の間隔が空いていた場合、空データで埋め合わせる
 * @param existingDays
 * @param newDays
 */
function mergeDays(existingDays: Day[], newDays: Day[]): Day[] {
  const updatedDays = [...existingDays];
  newDays.forEach((newDay) => {
    const existingIndex = updatedDays.findIndex(
      (day) => day.date === newDay.date
    );
    if (existingIndex !== -1) {
      updatedDays[existingIndex] = new Day(
        newDay.date,
        newDay.description,
        newDay.evaluation,
        newDay.tasks
      );
    } else {
      updatedDays.push(
        new Day(
          newDay.date,
          newDay.description,
          newDay.evaluation,
          newDay.tasks
        )
      );
    }
  });
  updatedDays.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return updatedDays;
}

onMounted(() => {
  fetchDaysData();
});

/**
 * 関数：指定したDayデータを空の状態で生成
 * @param year
 * @param month
 */
function generateDays(year: number, month: number): void {
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}/${String(month).padStart(2, "0")}/${String(
      day
    ).padStart(2, "0")}`;

    const existingDay =
      Array.isArray(days.value) && days.value.length > 0
        ? days.value.find((d) => d.date === dateStr)
        : null;

    // 日付が存在する場合はスキップ
    if (!existingDay) {
      const newDay = new Day(dateStr, "", "", []);

      if (!Array.isArray(days.value)) {
        days.value = [];
      }

      days.value.push(newDay);
    }

    days.value.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
}

/**
 * 関数：今日の年を文字列で返す
 * 例：2024/06/23 → 2024
 */
function getCurrentYear(): string {
  const today = new Date();
  const year = today.getFullYear();
  return `${year}`;
}

/**
 * 関数：今日の月を文字列で返す
 * 例：2024/06/23 → 06
 */
function getCurrentMonth(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${month}`;
}

/**
 * 関数：今日の日付を数値で返す
 * 例：2024/06/23 → 23
 */
function getTodayDateNumber(): number {
  const today = new Date();
  const date = today.getDate();
  return date;
}

/**
 * 関数：今日の日付を文字列「yyyy/MM/dd」で返す
 */
function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * 関数：現在の日付と時間を文字列「yyyy/MM/dd HH:mm:ss」で返す
 */
function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = ("0" + (now.getMonth() + 1)).slice(-2); // 月は0から始まるので+1
  const day = ("0" + now.getDate()).slice(-2);
  const hours = ("0" + now.getHours()).slice(-2);
  const minutes = ("0" + now.getMinutes()).slice(-2);
  const seconds = ("0" + now.getSeconds()).slice(-2);
  const date = `${year}/${month}/${day}`;
  const time = `${hours}:${minutes}:${seconds}`;
  return `${date} ${time}`;
}

/**
 * 関数：文字列「yyyy/MM/dd」を文字列「曜日」に変換
 * @param dateString
 */
function convertDateToDay(dateString: string): string {
  const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!dateString.match(datePattern)) {
    throw new Error("Invalid date format. Please use yyyy/MM/dd format.");
  }
  const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
  const [year, month, day] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day); // 月は0ベースのため-1
  const dayOfWeek = date.getDay();
  return daysOfWeek[dayOfWeek];
}

/**
 * 関数：文字列「yyyy/MM/dd」を文字列「MM/dd（曜日）」に変換
 * @param dateString
 */
function formatDateString(dateString: string): string {
  const date = new Date(dateString);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const dayOfWeek = date.toLocaleDateString("ja-JP", { weekday: "short" });
  return `${month}/${day}（${dayOfWeek}）`;
}

/**
 * 関数：「年」もしくは「月」を変更
 */
function selectYearOrMonth(): void {
  fetchDaysData();
  selected.value = 0;
}

/**
 * 関数：進捗度を計算
 * @param day
 */
function calcProgress(day: Day): void {
  const totalTasks = day.tasks.length;
  const completedTasks = day.tasks.filter((task) => task.done).length;
  day.progress = Math.round((completedTasks / totalTasks) * 100);
}

/**
 * 関数：編集or通常モード変更
 */
function modeChange(): void {
  if (mode.value === "normal") {
    mode.value = "edit";
  } else {
    updateDaysData("update", "auto");
    mode.value = "normal";
  }
}

/**
 * 関数：タスクの追加
 * @param dayIndex daysにあるどこのdayデータか
 * @param time 0/午前 1/午後
 */
function addTask(dayIndex: number, time: string): void {
  const tasks = days.value[dayIndex].tasks;
  const maxId =
    tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) : 0;
  const newTask = {
    id: maxId + 1,
    name: "",
    time: time === "0" ? "0" : "1",
    done: false,
  };
  tasks.push(newTask);
}

/**
 * 関数：タスクの削除
 * @param day 対象のdayデータ
 * @param taskId タスクID
 */
function deleteTask(day: Day, taskId: number): void {
  const taskIndex = day.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    day.tasks.splice(taskIndex, 1);
    calcProgress(day); // プログレスバーの再計算
    // day.progress = day.calculateProgress();
  }
}

/**
 * 関数：午前のタスクを摘出
 * @param tasks
 */
const getMorningTasks = (tasks: any) => {
  return tasks.filter((task: any) => task.time === "0");
};

/**
 * 関数：午後のタスクを摘出
 * @param tasks
 */
const getAfternoonTasks = (tasks: any) => {
  return tasks.filter((task: any) => task.time === "1");
};
</script>

<style scoped>
.v-card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.rounded-list {
  border-radius: 20px;
  overflow: hidden;
}

.v-card-subtitle {
  font-weight: normal; /* フォントの重さを調整 */
  font-size: 1rem;
  color: gray;
}

.v-card-item {
  align-items: center;
  display: grid;
  flex: none;
  grid-template-areas: "prepend content append";
  grid-template-columns: max-content auto max-content;
  padding: 0rem 1rem;
}

/* 点滅 */
.blinking {
  -webkit-animation: blink 1.5s ease-in-out infinite alternate;
  -moz-animation: blink 1.5s ease-in-out infinite alternate;
  animation: blink 1.5s ease-in-out infinite alternate;
}
@-webkit-keyframes blink {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@-moz-keyframes blink {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes blink {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
