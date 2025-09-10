import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white flex gap-4">
      <Link to="/">Home</Link>
      <Link to="/upload">Upload</Link>
    </nav>
  );
}
