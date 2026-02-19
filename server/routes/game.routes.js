const express = require("express");
const controller = require("../controllers/game.controllers");

const router = express.Router();

router.post("/start", controller.startGame);

router.post("/guess", controller.submitGuess);

router.post("/nextRound", controller.nextRound);

router.get("/round", controller.getRoundNumber);

module.exports = router;
