const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 8080 });

let senderSocket = null;
let receiverSocket = null;

wss.on("connection", function connection(ws) {
  console.log("Client connected");
  ws.on("error", console.error);
  ws.on("message", function message(data) {
    const message = JSON.parse(data);
    if (message.type === "sender") {
      senderSocket = ws;
    } else if (message.type === "receiver") {
      receiverSocket = ws;0
    } else if (message.type === "createOffer") {
      if (ws !== senderSocket) {
        return;
      }
      console.log("Offer received....");
      receiverSocket?.send(
        JSON.stringify({ type: "createOffer", sdp: message.sdp })
      );
    } else if (message.type === "createAnswer") {
      if (ws !== receiverSocket) {
        return;
      }
      console.log("Answer Recevied.....");
      senderSocket?.send(
        JSON.stringify({ type: "createAnswer", sdp: message.sdp })
      );
    } else if (message.type === "iceCandidate") {
      if (ws === senderSocket) {
        receiverSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      } else if (ws === receiverSocket) {
        senderSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      }
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
