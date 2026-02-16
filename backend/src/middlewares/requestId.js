const crypto = require("crypto");

function generateId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString("hex");
}

module.exports = function requestId(req, res, next) {
  const incoming = req.headers["x-request-id"];
  const requestId = typeof incoming === "string" && incoming.trim()
    ? incoming.trim()
    : generateId();

  req.requestId = requestId;
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
};
