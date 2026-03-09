const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: {
    token: "",
  },
});

socket.on("connect", () => {
  console.log("Connected", socket.id);
  socket.emit("join", { username: "c" });

  setTimeout(
    () => socket.emit("guess", { username: "c", guess: "Wrong answer" }),
    1000,
  );
  setTimeout(
    () => socket.emit("guess", { username: "c", guess: "Sleepwalking" }),
    2000,
  );
});

socket.on("joinResult", data => console.log("joinResult:", data));
socket.on("guessResult", data => console.log("guessResult:", data));
socket.on("state", data => console.log("state:", data));

socket.on("disconnect", () => console.log("Disconnected"));
