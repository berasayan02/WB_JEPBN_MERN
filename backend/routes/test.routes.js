const express = require("express");
const {
  startTest,
  submitTest,
  getMyHistory,
  getResultDetail,
} = require("../controllers/test.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/history", protect, getMyHistory);
router.get("/history/:id", protect, getResultDetail);
router.get("/:slug/start", protect, startTest);
router.post("/:slug/submit", protect, submitTest);

module.exports = router;
