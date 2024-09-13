require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { defaultProvider } = require("@aws-sdk/credential-provider-node"); // fromIniの代わりにdefaultProviderを使用
const app = express();

const HOST = "10.0.136.23"; // バックエンドのEC2インスタンスのプライベートIPアドレス
const ALLOWED_ORIGINS = ["https://rokiseth.net"]; // 許可するオリジンを指定

// CORS設定
const corsOptions = {
  origin: (origin, callback) => {
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// app.use(cors(corsOptions)); // CORSを有効にする
app.use(cors()); // CORSを有効にする
app.use(express.json()); // JSONボディをパースするミドルウェア

const REGION = process.env.AWS_REGION;
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const s3Client = new S3Client({
  region: REGION,
  credentials: defaultProvider(), // fromIniの代わりにdefaultProviderを使用
});

// ログ出力で環境変数を確認
console.log("AWS_REGION:", REGION);
console.log("S3_BUCKET_NAME:", BUCKET_NAME);

async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

// API関数
async function fetchDaysData(req, res) {
  console.log("Request received with the following data:", req.body);
  const { userName, selectedYear, selectedMonth, dataKey } = req.body;
  const bucketName = BUCKET_NAME;

  console.log("userName:", userName);
  console.log("selectedYear:", selectedYear);
  console.log("selectedMonth:", selectedMonth);
  console.log("dataKey:", dataKey);
  console.log("bucketName:", bucketName);

  try {
    const params = {
      Bucket: bucketName,
      Key: `${userName}/${selectedYear}${selectedMonth}/${dataKey}`,
      // キャッシュ無効化のためのヘッダー
      ResponseCacheControl: "no-cache",
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const data = await streamToString(response.Body);
    console.log("Data fetched:", data);

    if (!data) {
      console.error("No data found in the S3 object.");
      throw new Error("No data found in the S3 object.");
    }

    const jsonData = JSON.parse(data);
    console.log("JSON data parsed:", jsonData);

    res.json(jsonData);
  } catch (error) {
    console.error("Error fetching data from S3:", error);
    res.status(500).json({ error: error.message });
  }
}

// S3バケットにファイルが存在しない場合に作成する関数
async function createFileIfNotExists(req, res) {
  const { key } = req.body;
  const fileKey = `${key}`;
  const fileContent = JSON.stringify({ days: [] });

  console.log(`Checking file: ${fileKey}`);

  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ResponseCacheControl: "no-cache",
    };
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    console.log(response);
    console.log(`File ${fileKey} already exists.`, response);
    res.json({ fileCreated: false });
  } catch (headError) {
    if (headError instanceof Error) {
      if (headError.name === "NoSuchKey") {
        try {
          await s3Client.send(
            new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: fileKey,
              Body: fileContent,
              ContentType: "application/json",
            })
          );
          console.log(`File ${fileKey} created successfully.`);
          res.json({ fileCreated: true });
        } catch (putError) {
          console.error("Error creating file:", putError);
          res.status(500).json({ fileCreated: false, error: putError.message });
        }
      } else {
        console.error("Error checking file existence:", headError);
        res.status(500).json({ fileCreated: false, error: headError.message });
      }
    } else {
      console.error("Unknown error type:", headError);
      res.status(500).json({ fileCreated: false, error: "Unknown error type" });
    }
  }
}

async function updateDaysData(req, res) {
  const { userName, selectedYear, selectedMonth, dataKey, days } = req.body;
  const bucketName = BUCKET_NAME;

  const params = {
    Bucket: bucketName,
    Key: `${userName}/${selectedYear}${selectedMonth}/${dataKey}`,
    Body: JSON.stringify(days),
    ContentType: "application/json",
  };

  const command = new PutObjectCommand(params);

  try {
    const response = await s3Client.send(command);
    console.log("Upload success:", response);
    res.status(200).json({ message: "Upload success", response });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload error", error: error.message });
  }
}

app.post("/api/updateDaysData", updateDaysData);

app.post("/api/createFileIfNotExists", createFileIfNotExists);

// APIエンドポイントの設定
app.post("/api/fetchDaysData", fetchDaysData);

// HTTPSサーバーの起動
const PORT = process.env.PORT || 443;
const sslOptions = {
  key: fs.readFileSync("/home/ec2-user/ssl/privatekey.pem"),
  cert: fs.readFileSync("/home/ec2-user/ssl/certificate.pem"),
};

https.createServer(sslOptions, app).listen(PORT, HOST, () => {
  console.log(`HTTPS Server is running on https://${HOST}:${PORT}`);
});
