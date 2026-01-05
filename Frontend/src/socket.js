import { io } from "socket.io-client";

const socket = io("https://fourconnectgame.onrender.com", {
  transports: ["websocket"],
});

window.socket = socket;

export default socket;
