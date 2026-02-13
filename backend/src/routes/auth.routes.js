const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/trocar-senha", AuthController.trocarSenha);
router.post("/trocar-senha-token", AuthController.trocarSenhaToken);

module.exports = router;
