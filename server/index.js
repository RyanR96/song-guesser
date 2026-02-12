const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

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
