const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");
const app = express();
const gameRoutes = require("./routes/game.routes");

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/game", gameRoutes);

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

testPrismaConnection();
