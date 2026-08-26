const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const signUp = async (req, res) => {
  const { username, password } = req.body;

  const cleanedUsername = username?.trim();

  if (!cleanedUsername || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: cleanedUsername,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: cleanedUsername,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const cleanedUsername = username?.trim();

  if (!cleanedUsername || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: cleanedUsername,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "failed to get current user", err });
  }
};

module.exports = { signUp, login, me };
