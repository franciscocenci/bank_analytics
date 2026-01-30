const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const ImportController = require("../controllers/ImportController");

router.post("/vendas", auth, ImportController.importarMetas);

module.exports = router;
