const express = require("express");
const controller = require("../controllers/user.controllers");

const router = express.Router();

router.get("/:username/stats", controller.getUserStats);

module.exports = router;
