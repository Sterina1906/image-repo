import { useEffect, useState } from "react";
import axios from "axios";
import Comments from "./Comments";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/images").then((res) => {
      setImages(res.data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Image Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="border rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelected(img)}
          >
            <p className="p-3 font-medium">{img.title}</p>
            <img
              src={`http://localhost:5000/uploads/${img.filename}`}
              alt={img.title}
              className="w-full h-56 object-contain"
            />
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 w-3/4 max-w-xl relative">
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-red-500 text-xl"
            >
              ✖
            </button>

            <h2 className="text-xl font-semibold mt-2">
              {selected.title}
            </h2>

            {/* Full-size image */}
            <img
              src={`http://localhost:5000/uploads/${selected.filename}`}
              alt={selected.title}
              style={{
                width: selected.width ? `${selected.width}px` : "auto",
                height: selected.height ? `${selected.height}px` : "auto",
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
              className="w-full max-w-full h-auto object-contain mb-2"
            />

            {/* Delete button */}
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this image?")) {
                  axios
                    .delete(`http://localhost:5000/api/images/${selected.id}`)
                    .then(() => {
                      setImages(images.filter((img) => img.id !== selected.id));
                      setSelected(null);
                    })
                    .catch((err) => console.error(err));
                }
              }}
              className="absolute right-2 mr-5 bg-black text-white px-3 py-2 rounded hover:bg-gray-500 transition flex items-center gap-2"
            >
              🗑️
            </button>

            {/* Resize Section */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                placeholder="Width (px)"
                value={selected.width || ""}
                onChange={(e) => {
                  let w = Math.min(Number(e.target.value), 800);
                  setSelected({ ...selected, width: w });
                }}
                className="border px-2 py-1 rounded w-32"
              />
              <input
                type="number"
                placeholder="Height (px)"
                value={selected.height || ""}
                onChange={(e) => {
                  let h = Math.min(Number(e.target.value), 600);
                  setSelected({ ...selected, height: h });
                }}
                className="border px-2 py-1 rounded w-32"
              />
            </div>
            <button
              onClick={() => {
                axios
                  .patch(`http://localhost:5000/api/images/${selected.id}/resize`, {
                    width: selected.width,
                    height: selected.height,
                  })
                  .then((res) => {
                    setSelected(res.data);
                    setImages(
                      images.map((img) => (img.id === res.data.id ? res.data : img))
                    );
                    alert("Image size saved!");
                  })
                  .catch((err) => console.error(err));
              }}
              className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition"
            >
              Save Size
            </button>

            {/* Position Section */}
            <div className="flex items-center gap-2 mb-2 mt-2">
              <input
                type="number"
                placeholder="Position"
                value={selected.position || ""}
                onChange={(e) =>
                  setSelected({ ...selected, position: Number(e.target.value) })
                }
                className="border px-2 py-1 rounded w-32"
              />
              <button
                onClick={() => {
                  const pos = Number(selected.position);
                  if (!Number.isInteger(pos) || pos < 1) {
                    alert("Enter a valid position (number >= 1)");
                    return;
                  }
                  axios
                    .patch(`http://localhost:5000/api/images/${selected.id}/position`, {
                      position: pos,
                    })
                    .then((res) => {
                      setImages(res.data);
                      const updated = res.data.find((img) => img.id === selected.id);
                      setSelected(updated || null);
                      alert("Position updated!");
                    })
                    .catch((err) => {
                      console.error(err);
                      alert("Failed to update position");
                    });
                }}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
              >
                Save Position
              </button>
            </div>

            {/* Comments */}
            <Comments imageId={selected.id} />
          </div>
        </div>
      )}
    </div>
  );
}
