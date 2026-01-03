const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./db");
const setupSocket = require("./socket");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const server = http.createServer(app);
setupSocket(server);

const PORT = 5000;
server.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);