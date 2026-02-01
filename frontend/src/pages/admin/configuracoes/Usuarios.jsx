import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("usuario");
  const [agencias, setAgencias] = useState([]);
  const [agenciaId, setAgenciaId] = useState("");

  async function carregar() {
    try {
      const res = await api.get("/users");
      setUsuarios(res.data);
    } catch (err) {
      alert("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  async function carregarAgencias() {
    const res = await api.get("/agencias");
    setAgencias(res.data);
  }

  async function salvarUsuario() {
    try {
      await api.post("/users", {
        nome,
        email,
        senha,
        perfil,
        AgenciaId: agenciaId,
      });

      setCriando(false);
      setNome("");
      setEmail("");
      setSenha("");
      setPerfil("usuario");
      setAgenciaId("");

      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao criar usuário");
    }
  }

  useEffect(() => {
    carregar();
    carregarAgencias();
  }, []);

  return (
    <div>
      <h2>Usuários</h2>

      <button onClick={() => setCriando(true)}>Novo Usuário</button>

      {criando && (
        <div style={{ margin: "20px 0" }}>
          <h3>Novo Usuário</h3>

          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            <option value="usuario">Usuário</option>
            <option value="gerente">Gerente</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={agenciaId}
            onChange={(e) => setAgenciaId(e.target.value)}
          >
            <option value="">Selecione a agência</option>
            {agencias.map((a) => (
              <option key={a.id} value={a.id}>
                {a.codigo} - {a.nome}
              </option>
            ))}
          </select>

          <br />
          <br />

          <button onClick={salvarUsuario}>Salvar</button>
          <button onClick={() => setCriando(false)}>Cancelar</button>
        </div>
      )}

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Agência</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="5">Nenhum usuário cadastrado</td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>{u.perfil}</td>
                  <td>{u.Agencia?.nome || "-"}</td>
                  <td>
                    <button onClick={() => alert("editar depois")}>
                      Editar
                    </button>
                    <button onClick={() => alert("excluir depois")}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
