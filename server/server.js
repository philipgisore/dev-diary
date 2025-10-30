import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer for handling file uploads
const upload = multer({ dest: "uploads/" });

// Endpoint for uploading resumes
app.post("/upload", upload.single("resume"), (req, res) => {
  console.log("📄 File uploaded:", req.file);
  res.json({
    message: "File received successfully!",
    file: req.file,
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
