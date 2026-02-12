import { useEffect, useState } from "react";
import api from "../../../services/api";
import "./ConfiguracoesAdmin.css";

export default function Agencias() {
  const [agencias, setAgencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [ordenacao, setOrdenacao] = useState({ campo: "codigo", direcao: "asc" });

  function alternarOrdenacao(campo) {
    setOrdenacao((atual) => {
      if (atual.campo === campo) {
        return {
          campo,
          direcao: atual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return { campo, direcao: "asc" };
    });
  }

  function obterClasseSeta(campo) {
    if (ordenacao.campo !== campo) {
      return "sort-icon idle";
    }

    return ordenacao.direcao === "asc" ? "sort-icon up" : "sort-icon down";
  }

  function ordenarAgencias(lista) {
    const resultado = [...lista];

    resultado.sort((a, b) => {
      if (ordenacao.campo === "codigo") {
        const codigoA = a.codigo ?? "";
        const codigoB = b.codigo ?? "";
        const comparacao = String(codigoA).localeCompare(String(codigoB), "pt-BR", {
          numeric: true,
          sensitivity: "base",
        });
        return ordenacao.direcao === "asc" ? comparacao : -comparacao;
      }

      const nomeA = a.nome || "";
      const nomeB = b.nome || "";
      const comparacao = nomeA.localeCompare(nomeB, "pt-BR", {
        sensitivity: "base",
      });
      return ordenacao.direcao === "asc" ? comparacao : -comparacao;
    });

    return resultado;
  }

  async function carregar() {
    try {
      const res = await api.get("/agencias");
      setAgencias(res.data);
    } catch (err) {
      alert("Erro ao carregar agências");
    } finally {
      setLoading(false);
    }
  }

  async function excluir(id, nome) {
    if (!window.confirm(`Deseja excluir a agência "${nome}"?`)) return;

    try {
      await api.delete(`/agencias/${id}`);
      carregar();
    } catch {
      alert("Erro ao excluir agência");
    }
  }

  function iniciarEdicao(agencia) {
    setEditando(agencia.id);
    setNomeEditado(agencia.nome);
  }

  function cancelarEdicao() {
    setEditando(null);
    setNomeEditado("");
  }

  async function salvarEdicao(id) {
    if (!nomeEditado.trim()) {
      alert("O nome não pode ficar vazio");
      return;
    }

    try {
      setSalvando(true);

      await api.put(`/agencias/${id}`, {
        nome: nomeEditado,
      });

      setEditando(null);
      setNomeEditado("");
      carregar();
    } catch {
      alert("Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const agenciasOrdenadas = ordenarAgencias(agencias);

  return (
    <div className="config-page">
      <header className="config-header">
        <div>
          <p className="config-eyebrow">Configurações</p>
          <h2>Agências</h2>
          <p className="config-subtitle">
            Atualize o nome das agências e acompanhe as alterações em tempo
            real.
          </p>
        </div>
      </header>

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
                      ordenacao.campo === "codigo" ? " active" : ""
                    }`}
                    onClick={() => alternarOrdenacao("codigo")}
                  >
                    Código
                    <span className={obterClasseSeta("codigo")}>▲</span>
                  </button>
                </th>
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agenciasOrdenadas.length === 0 ? (
                <tr>
                  <td colSpan="3" className="config-empty">
                    Nenhuma agência cadastrada
                  </td>
                </tr>
              ) : (
                agenciasOrdenadas.map((a) => (
                  <tr key={a.id}>
                    <td>{a.codigo}</td>
                    <td>
                      {editando === a.id ? (
                        <input
                          className="config-input"
                          type="text"
                          value={nomeEditado}
                          onChange={(e) => setNomeEditado(e.target.value)}
                        />
                      ) : (
                        a.nome
                      )}
                    </td>
                    <td>
                      {editando === a.id ? (
                        <div className="action-stack">
                          <button
                            className="btn-primary"
                            onClick={() => salvarEdicao(a.id)}
                            disabled={salvando || nomeEditado === a.nome}
                          >
                            {salvando ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={cancelarEdicao}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="action-stack">
                          <button
                            className="btn-ghost"
                            onClick={() => iniciarEdicao(a)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => excluir(a.id, a.nome)}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
