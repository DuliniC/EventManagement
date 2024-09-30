const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

const connectDB = require("./db/db");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));

// Connect to DB
connectDB();

app.get("/Events/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "eventManagement.html"));
});

// Routes
const categoryRoutes = require("./routes/categoryRoutes");
app.use("/Events/", categoryRoutes);

const eventRoutes = require("./routes/eventRoutes");
app.use(
  "/events/",
  (req, res, next) => {
    req.io = io; // Attach `io` to the request object
    next();
  },
  eventRoutes
);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
