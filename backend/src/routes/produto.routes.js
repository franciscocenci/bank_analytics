const express = require("express");
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const ProdutoController = require("../controllers/ProdutoController");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorize(["admin"]),
  ProdutoController.index,
);

router.put(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  ProdutoController.update,
);

module.exports = router;
