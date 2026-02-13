import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function EsqueciSenha() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Esqueci minha senha</h1>
        <p style={{ fontSize: "14px" }}>
          Por enquanto, o reset de senha e feito pelo administrador. Entre em
          contato com o admin para receber o link de troca.
        </p>

        <button type="button" onClick={() => navigate("/login")}
        >
          Voltar para login
        </button>
      </div>
    </div>
  );
}
