import { useState } from "react";
import socket from "../socket";
function RegisterUser({ onRegistered }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const handleRegister = () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    socket.emit("registerUser", username.trim());
    onRegistered(username.trim());
  };
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <video autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover">
        <source src="/video.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>
      <h1 className="relative z-10 text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center animate-pulse">
        4 Connect in a Row 🟡🔴
      </h1>

      <div className="relative z-10 bg-gray-900 p-6 rounded-xl shadow-lg w-80 text-white">
        <h2 className="text-xl font-bold mb-4 text-center">
          Enter Username
        </h2>
        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          placeholder="Your name"
          className="w-full px-4 py-2 rounded bg-gray-800 outline-none mb-3"
        />
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold">
          Start
        </button>
      </div>
    </div>
  );
}
export default RegisterUser;
