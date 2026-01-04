import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

window.socket = socket;

export default socket;
