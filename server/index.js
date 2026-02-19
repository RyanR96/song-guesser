const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");
const app = express();
const GameEngine = require("./Game/gameEngine");
const { Prisma } = require("@prisma/client");
const { error } = require("console");
require("dotenv").config();

app.use(cors());
app.use(express.json());
const game = new GameEngine();

const PORT = 3000;

app.listen(PORT, () => {
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

app.post("/start", async (req, res) => {
  try {
    const songs = await prisma.song.findMany({
      take: 3,
    });
    const started = game.startGame(songs);
    console.log(songs);

    if (!started) {
      return res.status(400).json({ error: "Game could not be started" });
    }

    res.json({ message: "Game started" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error starting the game" });
  }
});

app.post("/guess", (req, res) => {
  const { username, guess } = req.body;
  const result = game.submitGuess(username, guess);
  res.json(result);
});

testPrismaConnection();
