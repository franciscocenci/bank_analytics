const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenQuery = typeof req.query?.token === "string" ? req.query.token : null;
  const headerToUse = authHeader || (tokenQuery ? `Bearer ${tokenQuery}` : null);

  if (!headerToUse) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const [, token] = headerToUse.split(" ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userPerfil = decoded.perfil;
    req.userAgenciaId = decoded.agenciaId;

    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};
