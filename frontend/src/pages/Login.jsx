import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    try {
      const res = await login(email, senha);

      // 🔐 Caso precise trocar senha
      if (res.trocaSenha) {
        navigate("/trocar-senha", {
          state: { email },
        });
        return;
      }

      // ✅ Login normal
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("ERRO LOGIN:", err.response?.data);
      setErro(
        err.response?.data?.error ||
          "Erro ao realizar login. Verifique os dados.",
      );
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Bem Vindo!</h1>

        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        {erro && <p className="erro">{erro}</p>}

        <button type="submit">Entrar</button>

        <div className="login-links">
          <button type="button" disabled>
            Criar conta
          </button>
          <button type="button" disabled>
            Esqueci minha senha
          </button>
        </div>
      </form>
    </div>
  );
}
