const express = require("express");

const {
  getFinancialInsights,
} = require("../controllers/aiController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/insights",
  getFinancialInsights
);

module.exports = router;