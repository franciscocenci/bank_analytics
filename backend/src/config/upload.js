const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === ".xlsx") {
      cb(null, true);
    } else {
      cb(new Error("Arquivo deve ser .xlsx"));
    }
  },
});
