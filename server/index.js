require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");
const app = express();
const gameRoutes = require("./routes/game.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const jwt = require("jsonwebtoken");

const http = require("http");
const { Server } = require("socket.io");
const game = require("./Game/gameEngine");

app.use(cors());
app.use(express.json());
app.use("/game", gameRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

let lobbyTimer = null;
let lobbyDuration = 5000;

function startLobbyCountdown() {
  if (game.isPlaying) return;
  if (Object.keys(game.players).length === 0) return;
  if (lobbyTimer) return;
  console.log(Object.keys(game.players).length);

  io.emit("lobbyState", {
    isCountingDown: true,
    timeLeft: lobbyDuration,
  });

  lobbyTimer = setTimeout(async () => {
    lobbyTimer = null;

    io.emit("lobbyState", {
      isCountingDown: false,
      timeLeft: 0,
    });

    if (!game.isPlaying && Object.keys(game.players).length > 0) {
      /**
       *       const songs = await prisma.song.findMany({
        take: 3,
      });
       */

      const songs = await prisma.$queryRaw`
      SELECT *
      FROM "Song"
      WHERE "previewUrl" IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 15
      `;

      game.startGame(songs);
      console.log("The songs that are passed into game", songs);
    }
  }, lobbyDuration);
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next();
  }

  try {
    console.log("handshake token", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.user = decoded;
    console.log("decoded user", socket.data.user);
    next();
  } catch (err) {
    console.log("Invalid token");
    return next(new Error("Invalid token"));
  }
});

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("join", async ({ username }) => {
    console.log("join request, username:", username);

    try {
      // if registered user
      if (socket.data.user) {
        const claimedUsername = socket.data.user.username;
        console.log("socket user:", socket.data.user);

        const result = game.joinGame({
          username: claimedUsername,
          isRegistered: true,
          userId: socket.data.user.id,
        });

        if (result.success) {
          socket.data.username = claimedUsername;
          console.log("2nd datausername for registered:", socket.data.username);
          startLobbyCountdown();
        }
        socket.emit("joinResult", result);
        io.emit("state", game.getState());
        return;
      }

      // if guest player
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        socket.emit("joinResult", {
          error: "Username already exists",
        });
        return;
      }

      const result = game.joinGame({
        username: username,
        isRegistered: false,
        userId: null,
      });

      if (result.success) {
        socket.data.username = username;
        console.log("datausername for NON registered:", socket.data.username);
        startLobbyCountdown();
      }

      socket.emit("joinResult", result);
      io.emit("state", game.getState());
    } catch (err) {
      console.error(err);
      socket.emit("joinResult", { error: "Server error joining game" });
    }
  });

  socket.on("guess", ({ guess }) => {
    const username = socket.data.username;

    const result = game.submitGuess(username, guess);

    socket.emit("guessResult", result);
    io.emit("state", game.getState());
  });

  socket.on("disconnect", () => {
    const username = socket.data.username;

    if (username) {
      const removed = game.leaveGame(username);
      if (removed) {
        io.emit("playerLeft", { username });
        io.emit("state", game.getState());
      }
    }
    console.log("User disconnected", socket.id);
  });
});

game.onStateChange = state => {
  io.emit("state", state);
};

game.onGameOver = async ({ leaderboard, players }) => {
  try {
    /**
     *     for (const username in players) {
      const player = players[username];

      if (!player.isRegistered) continue;

    
      await prisma.user.update({
        where: { id: player.userId },
        data: {
          totalPoints: { increment: player.score },
        },
      });
    }
     */

    const winner = leaderboard[0];

    if (winner) {
      const winningPlayer = players[winner.username];

      if (winningPlayer?.isRegistered && winningPlayer?.score > 0) {
        console.log(
          "IS registered, so increment this users wins:",
          winner.username,
        );
        await prisma.user.update({
          where: { id: winningPlayer.userId },
          data: {
            gamesWon: {
              increment: 1,
            },
          },
        });
      }
    }
    io.emit("gameOver", { leaderboard });
    startLobbyCountdown();
  } catch (err) {
    console.error("Failed to save end game data", err);
  }
};

// Update users totalPoints

game.onPlayerScored = async ({ player, points }) => {
  try {
    if (!player.isRegistered) return;

    await prisma.user.update({
      where: { id: player.userId },
      data: {
        totalPoints: { increment: points },
      },
    });
  } catch (err) {
    console.error("Failed to save player points", err);
  }
};

game.onPlayerCompletedRound = async ({ player, bothCorrectTime }) => {
  console.log("Attempting to update playercompletedround stats");
  try {
    if (!player.isRegistered) return;

    const user = await prisma.user.findUnique({
      where: { id: player.userId },
      select: { bestGuessTime: true },
    });

    const updateData = {
      totalGuessTime: { increment: bothCorrectTime },
      totalGuesses: { increment: 1 },
    };

    if (user.bestGuessTime === null || bothCorrectTime < user.bestGuessTime) {
      updateData.bestGuessTime = bothCorrectTime;
    }

    await prisma.user.update({
      where: { id: player.userId },
      data: updateData,
    });
  } catch (err) {
    console.error("Failed to save completed round stats", err);
  }
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
