import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "./Login.css"; // reaproveita o mesmo CSS

export default function TrocarSenha() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    try {
      const res = await api.post("/auth/trocar-senha", {
        email,
        senhaAtual,
        novaSenha,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      api.defaults.headers.Authorization = `Bearer ${token}`;

      navigate("/admin/dashboard");
    } catch (err) {
      setErro(
        err.response?.data?.error ||
          "Erro ao trocar senha. Verifique os dados.",
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

        <label>E-mail</label>
        <input type="email" value={email} disabled />

        <label>Senha atual</label>
        <input
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          required
        />

        <label>Nova senha</label>
        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />

        {erro && <p className="erro">{erro}</p>}

        <button type="submit">Salvar nova senha</button>
      </form>
    </div>
  );
}
