const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected", socket.id);
});

socket.emit("join", { username: "Ryan" });

socket.on("joinResult", data => console.log("joinResult:", data));
