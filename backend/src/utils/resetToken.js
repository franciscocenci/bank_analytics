const crypto = require("crypto");

function gerarResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiraEm = new Date(Date.now() + 1000 * 60 * 30);

  return { token, tokenHash, expiraEm };
}

function montarLinkTrocaSenha(token, baseUrl) {
  const origem = baseUrl || process.env.APP_BASE_URL || "http://localhost:5173";
  const urlBase = origem.replace(/\/$/, "");
  return `${urlBase}/trocar-senha?token=${encodeURIComponent(token)}`;
}

module.exports = {
  gerarResetToken,
  montarLinkTrocaSenha,
};
