import { useState } from "react";
import axios from "axios";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Choose a file!");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);

    await axios.post("http://localhost:5000/api/images", formData);
    alert("Uploaded!");
    setFile(null);
    setTitle("");
  };

  return (
    <form
      onSubmit={handleUpload}
      className="flex flex-col gap-3 max-w-md mx-auto border p-4 rounded-lg shadow"
    >
      <input
        type="text"
        placeholder="Image Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
      >
        Upload Image
      </button>
    </form>
  );
}
