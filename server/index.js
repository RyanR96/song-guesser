const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");
const app = express();
const gameRoutes = require("./routes/game.routes");
const authRoutes = require("./routes/auth.routes");

const http = require("http");
const { Server } = require("socket.io");
const game = require("./Game/gameEngine");

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/game", gameRoutes);
app.use("/auth", authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ username }) => {
    const result = game.joinGame(username);

    socket.emit("joinResult", result);
    io.emit("state", game.getState());
  });

  socket.on("guess", ({ username, guess }) => {
    const result = game.submitGuess(username, guess);

    socket.emit("guessResult", result);
    io.emit("state", game.getState());
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

game.onStateChange = state => {
  io.emit("state", state);
};

const PORT = 3000;
//server.listen or app.listen?
server.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});

app.get("/test", (req, res) => {
  res.json({ working: true });
});

async function testPrismaConnection() {
  try {
    const findSong = await prisma.song.findMany();
    console.log(
      "Prisma connected, this many songs in the DB:" + findSong.length,
    );
  } catch (err) {
    console.error("Prisma error in index", err);
  }
}

testPrismaConnection();
