module.exports = (perfisPermitidos = []) => {
  return (req, res, next) => {
    const perfilUsuario = req.userPerfil;

    if (!perfisPermitidos.includes(perfilUsuario)) {
      return res.status(403).json({
        error: "Acesso negado para este perfil",
      });
    }

    return next();
  };
};
