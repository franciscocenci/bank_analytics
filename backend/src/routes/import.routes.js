const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const upload = require("../config/upload");
const ImportController = require("../controllers/ImportController");

router.post(
  "/vendas",
  auth,
  authorize(["admin"]), // Admins only.
  upload.single("file"), // File is expected in the "file" field.
  ImportController.importarMetas,
);

router.get(
  "/vendas/progresso/:jobId",
  auth,
  authorize(["admin"]),
  ImportController.progressoImportacao,
);

module.exports = router;
