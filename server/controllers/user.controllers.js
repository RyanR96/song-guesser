const prisma = require("../prismaClient");

const getUserStats = async (req, res) => {
  const { username } = req.params;

  const cleanedUsername = username?.trim();

  if (!cleanedUsername) {
    return res.status(400).json({ message: "Username required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: cleanedUsername,
          mode: "insensitive",
        },
      },
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
