const express = require("express");
const path = require("path");
const http = require("http");
const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/chat", require("./routes/chat"));
app.use("/api/admin/chat", require("./routes/admin-chat"));
app.use("/api/users", require("./routes/users"));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
