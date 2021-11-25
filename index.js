const WebSocket = require("ws");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const url = require("url");

const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server: server });
app.get("/", (req, res) => res.send("Temst."));

var myClients = [];

wss.on("connection", function connection(ws, req) {
  var queryData = url.parse(req.url, true).query;
  myClients.push({
    id: queryData.id,
    wsoc: ws,
    isAlive: true,
  });

  console.log(`[+] ${req.socket.remoteAddress} Connected`);

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      message = {
        type: "alert",
        msg: `${queryData.id} has Connected.`,
      };
      client.send(JSON.stringify(message), { binary: false });
    }
  });

  ws.on("pong", () => {
    let x = myClients.find((o) => o.wsoc === ws);
    x.isAlive = true;
  });

  ws.on("message", function incoming(message) {
    console.log(`[!] Message Receieved from ${req.socket.remoteAddress}`);
    msg = JSON.parse(message);
    console.log(queryData);
    msg = { ...msg, time: new Date().toISOString() };
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg), { binary: false });
      }
    });
  });
});

wss.addListener("customClose", function (m) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      message = {
        type: "alert",
        msg: `${m} has Disconnected.`,
      };
      client.send(JSON.stringify(message), { binary: false });
    }
  });
});

const interval = setInterval(function ping() {
  myClients.forEach((clnt, index) => {
    if (clnt.isAlive === false) {
      console.log("[-]", clnt.id, "has Disconnected.");
      wss.emit("customClose", clnt.id);
      clnt.wsoc.terminate();
      myClients.splice(index, 1);
    }
    clnt.isAlive = false;
    clnt.wsoc.ping();
  });
}, 5000);

server.listen(PORT, () => console.log("Listening on port 3000"));
