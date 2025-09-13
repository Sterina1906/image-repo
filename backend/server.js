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

// Health check
app.get("/", (req, res) => {
  res.send("Gallery backend is running!");
});

// Upload image
app.post("/api/images", upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;

    // Shift all existing images down by 1
    await db.run("UPDATE images SET position = position + 1");

    // Insert the new image at position 1
    await db.run(
      "INSERT INTO images (filename, title, position) VALUES (?, ?, ?)",
      [req.file.filename, title, 1]
    );

    res.json({ message: "Image uploaded successfully at position 1" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Get all images
app.get("/api/images", async (req, res) => {
  const images = await db.all("SELECT * FROM images ORDER BY position ASC");
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

// Get comments for an image
app.get("/api/comments/:image_id", async (req, res) => {
  const comments = await db.all(
    "SELECT * FROM comments WHERE image_id = ? ORDER BY created_at DESC",
    [req.params.image_id]
  );
  res.json(comments);
});

// Delete image
app.delete("/api/images/:id", async (req, res) => {
  const imageId = req.params.id;

  // Get image filename
  const image = await db.get("SELECT filename FROM images WHERE id = ?", [
    imageId,
  ]);
  if (!image) return res.status(404).json({ message: "Image not found" });

  // Delete from database
  await db.run("DELETE FROM images WHERE id = ?", [imageId]);
  await db.run("DELETE FROM comments WHERE image_id = ?", [imageId]);

  // Normalize positions after delete
  const rows = await db.all(
    "SELECT id FROM images ORDER BY position ASC, uploaded_at ASC"
  );
  for (let i = 0; i < rows.length; i++) {
    await db.run("UPDATE images SET position = ? WHERE id = ?", [
      i + 1,
      rows[i].id,
    ]);
  }

  // Delete file from uploads folder
  fs.unlink(`uploads/${image.filename}`, (err) => {
    if (err) console.error(err);
  });

  res.json({ message: "Image deleted and positions normalized" });
});

// Update image dimensions
app.patch("/api/images/:id/resize", async (req, res) => {
  const { width, height } = req.body;
  const imageId = req.params.id;

  await db.run("UPDATE images SET width = ?, height = ? WHERE id = ?", [
    width,
    height,
    imageId,
  ]);
  const updatedImage = await db.get("SELECT * FROM images WHERE id = ?", [
    imageId,
  ]);
  res.json(updatedImage);
});

// Update image position (swap positions)
app.patch("/api/images/:id/position", async (req, res) => {
  try {
    const id = req.params.id;
    let position = Number(req.body.position);

    if (!Number.isInteger(position)) {
      return res.status(400).json({ error: "Invalid position" });
    }

    const cntRow = await db.get("SELECT COUNT(*) as cnt FROM images");
    const total = cntRow?.cnt || 0;
    if (total === 0) return res.status(400).json({ error: "No images in DB" });

    position = Math.max(1, Math.min(position, total));

    const current = await db.get(
      "SELECT id, position FROM images WHERE id = ?",
      [id]
    );
    if (!current) return res.status(404).json({ error: "Image not found" });

    const oldPos = Number(current.position);

    if (oldPos === position) {
      const images = await db.all("SELECT * FROM images ORDER BY position ASC");
      return res.json(images);
    }

    const other = await db.get("SELECT id FROM images WHERE position = ?", [
      position,
    ]);

    try {
      await db.run("BEGIN TRANSACTION");

      await db.run("UPDATE images SET position = ? WHERE id = ?", [-1, id]);

      if (other) {
        await db.run("UPDATE images SET position = ? WHERE id = ?", [
          oldPos,
          other.id,
        ]);
      }

      await db.run("UPDATE images SET position = ? WHERE id = ?", [
        position,
        id,
      ]);

      await db.run("COMMIT");
    } catch (txErr) {
      await db.run("ROLLBACK");
      console.error("Transaction error:", txErr);
      return res.status(500).json({ error: "Failed to swap positions" });
    }

    const images = await db.all("SELECT * FROM images ORDER BY position ASC");
    return res.json(images);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
