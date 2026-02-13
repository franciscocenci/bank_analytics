import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function CriarConta() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [codigoAgencia, setCodigoAgencia] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!nome || !email || !codigoAgencia) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      setEnviando(true);
      const res = await api.post("/auth/register", {
        nome,
        email,
        codigoAgencia,
      });

      setSucesso(
        res.data?.message ||
          "Cadastro enviado. Aguarde a aprovacao do administrador.",
      );
      setNome("");
      setEmail("");
      setCodigoAgencia("");
    } catch (err) {
      setErro(
        err.response?.data?.error ||
          "Erro ao enviar cadastro. Verifique os dados.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Criar Conta</h1>

        <label>Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Codigo da Agencia</label>
        <input
          type="text"
          value={codigoAgencia}
          onChange={(e) => setCodigoAgencia(e.target.value)}
          required
        />

        {erro && <p className="erro">{erro}</p>}
        {sucesso && <p className="erro" style={{ color: "#0f4c81" }}>{sucesso}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar cadastro"}
        </button>

        <div className="login-links">
          <button type="button" onClick={() => navigate("/login")}
          >
            Voltar para login
          </button>
        </div>
      </form>
    </div>
  );
}
