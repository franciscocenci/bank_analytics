const express = require("express");
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const AgenciaController = require("../controllers/AgenciaController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorize(["admin"]),
  AgenciaController.create,
);

router.get(
  "/",
  authMiddleware,
  authorize(["admin", "gerente"]),
  AgenciaController.index,
);

router.get(
  "/:id",
  authMiddleware,
  authorize(["admin", "gerente"]),
  AgenciaController.show,
);

router.put(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  AgenciaController.update,
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  AgenciaController.delete,
);

module.exports = router;
