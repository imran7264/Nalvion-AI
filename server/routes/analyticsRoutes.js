const express = require("express");

const {
  getMonthlyAnalysis,
} = require("../controllers/analyticsController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.use(authMiddleware);

router.get(
  "/monthly",
  getMonthlyAnalysis
);

module.exports = router;