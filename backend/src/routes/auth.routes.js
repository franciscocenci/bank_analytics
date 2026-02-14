const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Muitas tentativas. Tente novamente em instantes." },
});

router.post("/register", AuthController.register);
router.post("/login", loginLimiter, AuthController.login);
router.post("/trocar-senha", AuthController.trocarSenha);
router.post("/trocar-senha-token", AuthController.trocarSenhaToken);

module.exports = router;
