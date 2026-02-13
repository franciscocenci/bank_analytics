import { useEffect, useState } from "react";
import api from "../../../services/api";
import { formatarDataHoraBR, tempoRelativo } from "../../../utils/date";
import "./ConfiguracoesAdmin.css";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("usuario");
  const [agencias, setAgencias] = useState([]);
  const [agenciaId, setAgenciaId] = useState("");
  const [editando, setEditando] = useState(null);
  const [ordenacao, setOrdenacao] = useState({ campo: "nome", direcao: "asc" });
  const [linkModal, setLinkModal] = useState({ open: false, link: "" });
  const [linkCopiado, setLinkCopiado] = useState(false);

  function alternarOrdenacao(campo) {
    setOrdenacao((atual) => {
      if (atual.campo === campo) {
        return {
          campo,
          direcao: atual.direcao === "asc" ? "desc" : "asc",
        };
      }

      const direcaoInicial = campo === "nome" ? "asc" : "desc";
      return { campo, direcao: direcaoInicial };
    });
  }

  function obterClasseSeta(campo) {
    if (ordenacao.campo !== campo) {
      return "sort-icon idle";
    }

    let direcao = ordenacao.direcao;
    if (campo !== "nome") {
      direcao = ordenacao.direcao === "desc" ? "desc" : "asc";
    }

    return direcao === "asc" ? "sort-icon up" : "sort-icon down";
  }

  function ordenarUsuarios(lista) {
    const resultado = [...lista];

    resultado.sort((a, b) => {
      if (ordenacao.campo === "nome") {
        const nomeA = a.nome || "";
        const nomeB = b.nome || "";
        const comparacao = nomeA.localeCompare(nomeB, "pt-BR", {
          sensitivity: "base",
        });
        return ordenacao.direcao === "asc" ? comparacao : -comparacao;
      }

      const valorA = new Date(a[ordenacao.campo]).getTime();
      const valorB = new Date(b[ordenacao.campo]).getTime();
      const safeA = Number.isNaN(valorA) ? 0 : valorA;
      const safeB = Number.isNaN(valorB) ? 0 : valorB;

      return ordenacao.direcao === "desc" ? safeB - safeA : safeA - safeB;
    });

    return resultado;
  }

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

  function abrirLinkModal(link) {
    if (!link) return;
    setLinkCopiado(false);
    setLinkModal({ open: true, link });
  }

  function fecharLinkModal() {
    setLinkModal({ open: false, link: "" });
    setLinkCopiado(false);
  }

  async function copiarLink() {
    if (!linkModal.link) return;

    try {
      await navigator.clipboard.writeText(linkModal.link);
      setLinkCopiado(true);
    } catch {
      alert("Nao foi possivel copiar. Copie manualmente o link.");
    }
  }

  async function salvarUsuario() {
    if (!nome || !email || !perfil || !agenciaId) {
      alert("Preencha todos os campos");
      return;
    }
    try {
      const res = await api.post("/users", {
        nome,
        email,
        perfil,
        agenciaId: agenciaId,
      });

      abrirLinkModal(res.data?.linkTrocaSenha);

      setCriando(false);
      setNome("");
      setEmail("");
      setPerfil("usuario");
      setAgenciaId("");

      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao criar usuário");
    }
  }

  async function excluirUsuario(id) {
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;

    try {
      await api.delete(`/users/${id}`);
      carregar(); // recarrega a lista
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao excluir usuário");
    }
  }

  async function resetarSenha(id) {
    if (
      !window.confirm(
        "Deseja resetar a senha deste usuário? Uma nova senha provisória será gerada.",
      )
    ) {
      return;
    }

    try {
      const res = await api.put(`/users/${id}/reset-senha`);
      abrirLinkModal(res.data?.linkTrocaSenha);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao resetar senha");
    }
  }

  function obterStatus(u) {
    if (!u.aprovado) {
      return { label: "Pendente", tipo: "pendente", acao: () => aprovarUsuario(u.id) };
    }

    if (u.trocaSenha) {
      return {
        label: "Aguardando senha",
        tipo: "pendente",
        acao: () => resetarSenha(u.id),
      };
    }

    return { label: "Ativo", tipo: "ativo", acao: null };
  }

  async function aprovarUsuario(id) {
    if (!window.confirm("Aprovar este usuário e gerar link de troca de senha?")) {
      return;
    }

    try {
      const res = await api.put(`/users/${id}/aprovar`);
      abrirLinkModal(res.data?.linkTrocaSenha);
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao aprovar usuário");
    }
  }

  async function atualizarUsuario() {
    if (!nome || !perfil || !agenciaId) {
      alert("Nome, perfil e agência são obrigatórios");
      return;
    }

    try {
      await api.put(`/users/${editando.id}`, {
        nome,
        perfil,
        agenciaId: agenciaId,
        // senha NÃO vai se estiver vazia
      });

      setEditando(null);
      setCriando(false);

      setNome("");
      setEmail("");
      setPerfil("usuario");
      setAgenciaId("");

      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao atualizar usuário");
    }
  }

  function editarUsuario(u) {
    setEditando(u);
    setCriando(true);

    setNome(u.nome);
    setEmail(u.email);
    setPerfil(u.perfil);
    setAgenciaId(u.agenciaId);
  }

  useEffect(() => {
    carregar();
    carregarAgencias();
  }, []);

  const usuariosOrdenados = ordenarUsuarios(usuarios);

  return (
    <div className="config-page">
      <header className="config-header">
        <div>
          <p className="config-eyebrow">Configurações</p>
          <h2>Usuários</h2>
          <p className="config-subtitle">
            Crie, edite e gerencie o acesso dos usuários do sistema.
          </p>
        </div>
        <div className="config-header-actions">
          <button className="btn-primary" onClick={() => setCriando(true)}>
            Novo usuário
          </button>
        </div>
      </header>

      {criando && (
        <section className="config-card config-panel">
          <h3>{editando ? "Editar usuário" : "Novo usuário"}</h3>

          <form
            className="config-form"
            onSubmit={(e) => {
              e.preventDefault();

              if (editando) {
                atualizarUsuario();
              } else {
                salvarUsuario();
              }
            }}
          >
            <div className="config-form-grid">
              <input
                className="config-input"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <input
                className="config-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!editando}
              />

              {!editando && (
                <p className="config-helper">
                  A senha será definida pelo usuário através do link de troca.
                </p>
              )}

              <select
                className="config-select"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                required
              >
                <option value="usuario">Usuário</option>
                <option value="gerente">Gerente</option>
                <option value="admin">Admin</option>
              </select>

              <select
                className="config-select"
                value={agenciaId}
                onChange={(e) => setAgenciaId(e.target.value)}
                required
              >
                <option value="">Selecione uma agência</option>

                {agencias.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="config-form-actions">
              <button className="btn-primary" type="submit">
                {editando ? "Atualizar" : "Salvar"}
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  setCriando(false);
                  setEditando(null);
                  setNome("");
                  setEmail("");
                  setPerfil("usuario");
                  setAgenciaId("");
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="config-card">
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="config-table">
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className={`sort-button${
                      ordenacao.campo === "nome" ? " active" : ""
                    }`}
                    onClick={() => alternarOrdenacao("nome")}
                  >
                    Nome
                    <span className={obterClasseSeta("nome")}>▲</span>
                  </button>
                </th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Agência</th>
                <th>
                  <button
                    type="button"
                    className={`sort-button${
                      ordenacao.campo === "createdAt" ? " active" : ""
                    }`}
                    onClick={() => alternarOrdenacao("createdAt")}
                  >
                    Criado
                    <span className={obterClasseSeta("createdAt")}>▲</span>
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className={`sort-button${
                      ordenacao.campo === "updatedAt" ? " active" : ""
                    }`}
                    onClick={() => alternarOrdenacao("updatedAt")}
                  >
                    Atualizado
                    <span className={obterClasseSeta("updatedAt")}>▲</span>
                  </button>
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="config-empty">
                    Nenhum usuário cadastrado
                  </td>
                </tr>
              ) : (
                usuariosOrdenados.map((u) => {
                  const status = obterStatus(u);
                  const statusDisabled = !status.acao;

                  return (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{u.perfil}</td>
                    <td>
                      <button
                        type="button"
                        className={`status-pill ${
                          status.tipo === "ativo" ? "status-ativo" : "status-pendente"
                        }`}
                        onClick={() => {
                          if (status.acao) {
                            status.acao();
                          }
                        }}
                        disabled={statusDisabled}
                      >
                        {status.label}
                      </button>
                    </td>
                    <td>{u.agencia?.nome || "-"}</td>
                    <td>
                      {u.createdAt
                        ? `${formatarDataHoraBR(u.createdAt)} (${tempoRelativo(u.createdAt)})`
                        : "-"}
                    </td>
                    <td>
                      {u.updatedAt
                        ? `${formatarDataHoraBR(u.updatedAt)} (${tempoRelativo(u.updatedAt)})`
                        : "-"}
                    </td>
                    <td>
                      <div className="action-stack">
                        {!u.aprovado && (
                          <button
                            className="btn-primary"
                            onClick={() => aprovarUsuario(u.id)}
                          >
                            Aprovar
                          </button>
                        )}
                        {u.aprovado && u.trocaSenha && (
                          <button
                            className="btn-secondary"
                            onClick={() => resetarSenha(u.id)}
                          >
                            Gerar link
                          </button>
                        )}
                        <button
                          className="btn-ghost"
                          onClick={() => editarUsuario(u)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => resetarSenha(u.id)}
                        >
                          Resetar senha
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => excluirUsuario(u.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        )}
      </section>

      {linkModal.open && (
        <div className="link-modal-backdrop" role="dialog" aria-modal="true">
          <div className="link-modal">
            <h3>Link de troca de senha</h3>
            <p>
              Copie o link abaixo. Ele sera exibido apenas uma vez para este
              usuario.
            </p>

            <div className="link-modal-box">
              <input type="text" value={linkModal.link} readOnly />
              <button type="button" className="btn-secondary" onClick={copiarLink}>
                {linkCopiado ? "Copiado" : "Copiar"}
              </button>
            </div>

            <div className="link-modal-actions">
              <button type="button" className="btn-primary" onClick={fecharLinkModal}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
