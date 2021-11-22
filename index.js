const WebSocket = require("ws");
const express = require("express");
const app = express();
const server = require("http").createServer(app);

const PORT = process.env.PORT || 3000

const wss = new WebSocket.Server({ server: server });
app.get("/", (req, res) => res.send("Temst."));

wss.on("connection", function connection(ws, req) {
  console.log(`[+] ${req.socket.remoteAddress} Connected`);
  ws.on("message", function incoming(message) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message, { binary: false });
      }
    });
  });
});

server.listen(PORT, () => console.log("Listening on port 3000"));
