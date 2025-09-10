import express from "express";
import cors from "cors";
import multer from "multer";
import { initDB } from "./db.js";
import fs from "fs";
const app = express();
const port = process.env.PORT || 5000;
const upload = multer({ dest: "uploads/" });
const db = await initDB();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Upload image
app.get("/", (req, res) => {
  res.send("Gallery backend is running!");
});
app.post("/api/images", upload.single("image"), async (req, res) => {
  const { title } = req.body;
  await db.run("INSERT INTO images (filename, title) VALUES (?, ?)", [
    req.file.filename,
    title,
  ]);
  res.json({ message: "Image uploaded successfully" });
});

// Get all images
app.get("/api/images", async (req, res) => {
  const images = await db.all(
    "SELECT id, filename, title, width, height FROM images ORDER BY uploaded_at DESC"
    );
  res.json(images);
});

// Add comment
app.post("/api/comments", async (req, res) => {
  const { image_id, text } = req.body;
  await db.run("INSERT INTO comments (image_id, text) VALUES (?, ?)", [
    image_id,
    text,
  ]);
  res.json({ message: "Comment added" });
});

// Get comments
app.get("/api/comments/:image_id", async (req, res) => {
  const comments = await db.all(
    "SELECT * FROM comments WHERE image_id = ? ORDER BY created_at DESC",
    [req.params.image_id]
  );
  res.json(comments);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
// Delete image
app.delete("/api/images/:id", async (req, res) => {
  const imageId = req.params.id;

  // Get image filename to remove from uploads folder
  const image = await db.get("SELECT filename FROM images WHERE id = ?", [imageId]);
  if (!image) return res.status(404).json({ message: "Image not found" });

  // Delete from database
  await db.run("DELETE FROM images WHERE id = ?", [imageId]);
  await db.run("DELETE FROM comments WHERE image_id = ?", [imageId]);

  // Delete file from uploads folder
 
  fs.unlink(`uploads/${image.filename}`, (err) => {
    if (err) console.error(err);
  });

  res.json({ message: "Image deleted successfully" });
});
// Update image dimensions
app.patch("/api/images/:id/resize", async (req, res) => {
  const { width, height } = req.body;
  const imageId = req.params.id;

  await db.run(
    "UPDATE images SET width = ?, height = ? WHERE id = ?",
    [width, height, imageId]
  );
  const updatedImage = await db.get("SELECT * FROM images WHERE id = ?", [imageId]);
  res.json(updatedImage);
  
});
