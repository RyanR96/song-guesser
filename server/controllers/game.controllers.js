const prisma = require("../prismaClient");
const game = require("../Game/gameEngine");

const startGame = async (req, res) => {
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
};

const submitGuess = (req, res) => {
  const { username, guess } = req.body;
  const result = game.submitGuess(username, guess);
  res.json(result);
};

const nextRound = (req, res) => {
  const success = game.nextRound();
  res.json({ success });
};

const getRoundNumber = (req, res) => {
  res.json({ round: game.currentRoundNumber });
};

module.exports = { startGame, submitGuess, nextRound, getRoundNumber };
