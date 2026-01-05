import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import setupSocket from "./socket.js";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
connectDB();

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
