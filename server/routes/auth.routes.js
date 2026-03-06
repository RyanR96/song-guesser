const express = require("express");
const controller = require("../controllers/auth.controllers");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/signup", controller.signUp);

router.post("/login", controller.login);

router.get("/me", verifyToken, controller.me);

module.exports = router;
