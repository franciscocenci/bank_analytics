const express = require("express");
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const UserController = require("../controllers/UserController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorize(["admin", "gerente"]),
  UserController.create,
);

router.get(
  "/",
  authMiddleware,
  authorize(["admin", "gerente"]),
  UserController.index,
);

router.get("/:id", authMiddleware, UserController.show);

router.put("/:id", authMiddleware, UserController.update);

router.put("/:id/reset-senha", authMiddleware, UserController.resetSenha);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  UserController.delete,
);

module.exports = router;
