import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Create an uploads folder if it doesn't exist
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer to save files in the uploads directory
const upload = multer({ dest: "uploads/" });

// Handle file upload
app.post("/upload", upload.single("resume"), (req, res) => {
  console.log("📄 File uploaded:", req.file);
  res.json({
    message: "File received successfully!",
    file: req.file,
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
