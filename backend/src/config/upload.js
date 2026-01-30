const multer = require("multer");

const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Arquivo deve ser .xlsx"));
    }
  },
});
