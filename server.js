const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
const upload = multer({ dest: "temp/" });

const UPLOAD_DIR = path.join(__dirname, "uploads");

app.post("/upload", upload.single("file"), (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { currentChunk, totalChunks } = req.body;
  const fileName = req.body.fileName || file.originalname;

  const chunkDir = path.join(UPLOAD_DIR, fileName + "-chunks");

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir, { recursive: true });
  }

  const chunkPath = path.join(chunkDir, `chunk-${currentChunk}`);
  fs.renameSync(file.path, chunkPath);

  if (parseInt(currentChunk) === parseInt(totalChunks) - 1) {
    // 所有分片上传完成，开始合并
    const filePath = path.join(UPLOAD_DIR, fileName);
    const writeStream = fs.createWriteStream(filePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk-${i}`);
      const chunkBuffer = fs.readFileSync(chunkPath);
      writeStream.write(chunkBuffer);
      fs.unlinkSync(chunkPath);
    }

    writeStream.end();
    writeStream.on('finish', () => {
      fs.rmdirSync(chunkDir);
      res.json({ message: "File uploaded successfully" });
    });
    writeStream.on('error', (err) => {
      console.error("Error writing file:", err);
      res.status(500).json({ message: "Error uploading file" });
    });
  } else {
    res.json({ message: "Chunk uploaded successfully" });
  }
});

// 添加一个错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(3000, () => console.log("Server started on port 3000"));