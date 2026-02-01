const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const upload = require("../config/upload");
const ImportController = require("../controllers/ImportController");

router.post(
  "/vendas",
  auth,
  authorize(["admin"]), // 🔐 SOMENTE ADMIN
  upload.single("file"), // 📎 arquivo vem no campo "file"
  ImportController.importarMetas,
);

module.exports = router;
