const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected", socket.id);
  socket.emit("join", { username: "Bryan" });

  setTimeout(
    () => socket.emit("guess", { username: "Bryan", guess: "Wrong answer" }),
    1000,
  );
  setTimeout(
    () => socket.emit("guess", { username: "Bryan", guess: "Sleepwalking" }),
    2000,
  );
});

socket.on("joinResult", data => console.log("joinResult:", data));
socket.on("guessResult", data => console.log("guessResult:", data));
socket.on("state", data => console.log("state:", data));

socket.on("disconnect", () => console.log("Disconnected"));
