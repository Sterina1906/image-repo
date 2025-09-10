import { useEffect, useState } from "react";
import axios from "axios";

export default function Comments({ imageId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const fetchComments = () => {
    axios.get(`http://localhost:5000/api/comments/${imageId}`).then((res) => {
      setComments(res.data);
    });
  };

  useEffect(() => {
    fetchComments();
  }, [imageId]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await axios.post("http://localhost:5000/api/comments", {
      image_id: imageId,
      text,
    });
    setText("");
    fetchComments();
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Comments</h3>
      <form onSubmit={addComment} className="flex gap-2 mb-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow border p-2 rounded"
        />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">
          🡅
        </button>
      </form>

      <ul className="space-y-2 max-h-40 overflow-y-auto">
        {comments.map((c) => (
          <li key={c.id} className="bg-gray-100 p-2 rounded">
            {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
