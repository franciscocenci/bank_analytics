import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "./Login.css"; // reaproveita o mesmo CSS

export default function TrocarSenha() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  const [email, setEmail] = useState(location.state?.email || "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (!token && senhaAtual === novaSenha) {
      setErro("A nova senha não pode ser igual à senha atual");
      return;
    }

    if (token && novaSenha !== confirmarSenha) {
      setErro("As senhas não conferem");
      return;
    }

    try {
      const endpoint = token ? "/auth/trocar-senha-token" : "/auth/trocar-senha";
      const requestUrl = api.defaults.baseURL
        ? new URL(endpoint, api.defaults.baseURL).toString()
        : endpoint;

      const res = token
        ? await api.post(requestUrl, {
            token,
            novaSenha,
          })
        : await api.post(requestUrl, {
            email,
            senhaAtual,
            novaSenha,
          });

      const { token: authToken, user } = res.data;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(user));

      api.defaults.headers.Authorization = `Bearer ${authToken}`;

      navigate("/admin/dashboard");
    } catch (err) {
      const responseData = err.response?.data;
      const responseError =
        responseData && typeof responseData === "object"
          ? responseData.error || responseData.message
          : null;
      const statusInfo = err.response?.status
        ? ` (status ${err.response.status})`
        : "";

      if (
        typeof responseData === "string" &&
        responseData.includes("<!doctype html")
      ) {
        setErro("Erro ao trocar senha. A API nao respondeu corretamente.");
        return;
      }

      setErro(
        responseError ||
          err.message ||
          `Erro ao trocar senha. Verifique os dados.${statusInfo}`,
      );
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Trocar Senha</h1>
        <p style={{ fontSize: "14px", marginBottom: "10px" }}>
          Por segurança, você precisa criar uma nova senha antes de acessar o
          sistema.
        </p>

        {!token && (
          <>
            <label>E-mail</label>
            <input type="email" value={email} disabled />

            <label>Senha atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
            />
          </>
        )}

        <label>Nova senha</label>
        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />

        {token && (
          <>
            <label>Confirmar nova senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </>
        )}

        {erro && <p className="erro">{erro}</p>}


        <button type="submit">Salvar nova senha</button>
      </form>
    </div>
  );
}
