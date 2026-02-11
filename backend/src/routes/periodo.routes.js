const express = require("express");
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const PeriodoController = require("../controllers/PeriodoController");

const router = express.Router();

// Admin-only access for period management.
router.get("/", authMiddleware, authorize(["admin"]), PeriodoController.index);

router.post(
  "/",
  authMiddleware,
  authorize(["admin"]),
  PeriodoController.create,
);

router.put(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  PeriodoController.update,
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  PeriodoController.delete,
);

module.exports = router;
