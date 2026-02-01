import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const entrar = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        senha,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("perfil", res.data.user.perfil);

      window.location.href = "/admin";
    } catch (err) {
      setErro("E-mail ou senha inválidos");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Bem vindo!</h2>

      <div style={styles.card}>
        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <button onClick={entrar} style={styles.btnEntrar}>
        Entrar
      </button>

      <button style={styles.btnCadastro}>Cadastro</button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fa",
  },
  card: {
    background: "#0d8bff",
    padding: 20,
    borderRadius: 12,
    width: 280,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    color: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  },
  btnEntrar: {
    marginTop: 15,
    padding: 12,
    width: 280,
    background: "#2dd4bf",
    border: "none",
    borderRadius: 25,
    fontSize: 16,
    cursor: "pointer",
  },
  btnCadastro: {
    marginTop: 10,
    padding: 12,
    width: 280,
    background: "#8b5cf6",
    border: "none",
    borderRadius: 25,
    fontSize: 16,
    color: "#fff",
    cursor: "pointer",
  },
};
