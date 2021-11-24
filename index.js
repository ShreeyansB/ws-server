const WebSocket = require("ws");
const express = require("express");
const app = express();
const server = require("http").createServer(app);

const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server: server });
app.get("/", (req, res) => res.send("Temst."));

var tm;

function ping(client) {
  tm = setTimeout(function () {
    console.log(`[-] ${client} Disconnected`);
    wss.emit("customClose", client);
  }, 5000);
}

function pong(client) {
  clearInterval(tm);
  // console.log("[!] Cleared timeout");
  ping(client);
}

wss.on("connection", function connection(ws, req) {
  ping();
  console.log(`[+] ${req.socket.remoteAddress} Connected`);
  ws.on("message", function incoming(message) {
    if (message == "__ping__") {
      console.log(`[!] Ping Receieved from ${req.socket.remoteAddress}`);
      pong(req.socket.remoteAddress);
    } else {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message, { binary: false });
        }
      });
    }
  });
});

wss.addListener("customClose", function (m) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(`${m} has Disconnected.`, { binary: false });
    }
  });
});

server.listen(PORT, () => console.log("Listening on port 3000"));
