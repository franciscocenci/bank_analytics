const express = require("express");
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

const router = express.Router();

router.get("/admin-only", authMiddleware, authorize(["admin"]), (req, res) => {
  return res.json({ message: "Bem-vindo, administrador" });
});

router.get(
  "/gestao",
  authMiddleware,
  authorize(["admin", "gerente"]),
  (req, res) => {
    return res.json({ message: "Área de gestão" });
  },
);

router.get(
  "/dashboard",
  authMiddleware,
  authorize(["admin", "gerente", "usuario"]),
  (req, res) => {
    return res.json({ message: "Dashboard liberado" });
  },
);

module.exports = router;
