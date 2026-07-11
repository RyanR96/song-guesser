const prisma = require("../prismaClient");

const getUserStats = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        totalPoints: true,
        gamesWon: true,
        bestGuessTime: true,
        totalGuesses: true,
        totalGuessTime: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Failed to fetch user stats", err);
    res.status(500).json({ message: "Failed to fetch user stats" });
  }
};

module.exports = { getUserStats };
