# 📸 Image Gallery

A simple full-stack image gallery application built with **React (Vite)** frontend and **Node.js + Express + SQLite** backend.  
Supports uploading images, viewing them in a gallery, commenting, and deleting images.

---

## 🚀 Features

- Upload images.
- Display images in a gallery.
- Comment system for each image.
- Delete images (removes DB entry + file).
- Images ordered by **latest upload first**.

---

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```
### 2. Install Dependencies
*Backend*
```bash
cd backend
npm install
```
*Frontend*
```bash
cd ../frontend
npm install
```
*Database Setup*
```bash
cd ../backend
rm -f gallery.db   # Linux/Mac
del gallery.db     # Windows PowerShell
# Start server to auto-create DB
```
## Running the project
*Start Backend (Express + SQLite)*
```bash
cd backend
npm run dev
```
*Start Frontend (React + Vite)*
```bash
cd frontend
npm run dev
```
By default:

Frontend: http://localhost:5173/

Backend: http://localhost:5000/

## 📸 How It Works
1.User uploads an image.

2.*Backend:*

   Stores file in uploads/.

   Saves info in gallery.db.

3.*Frontend:*

Fetches images from backend.

Displays gallery.

4.Allows comments and deletion.

5.Newly uploaded images appear at position 1.

## ⚡ Tech Stack

Frontend: React, Vite, Axios

Backend: Node.js, Express

Database: SQLite

Uploads: Multer

## 📜 License
MIT License © 2025
