import { useEffect, useState } from "react";
import api from "../../../services/api";
import { formatarDataBR } from "../../../utils/date";
import "./ConfiguracoesAdmin.css";

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState(null);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  async function carregar() {
    try {
      const res = await api.get("/periodos");
      setPeriodos(res.data);
    } catch (err) {
      alert("Erro ao carregar períodos");
    } finally {
      setLoading(false);
    }
  }

  async function salvarPeriodo() {
    if (!dataInicio || !dataFim) {
      alert("Informe data inicial e data final");
      return;
    }

    try {
      await api.post("/periodos", {
        dataInicio,
        dataFim,
      });

      setCriando(false);
      setDataInicio("");
      setDataFim("");

      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao salvar período");
    }
  }

  async function atualizarPeriodo() {
    if (!dataInicio || !dataFim) {
      alert("Informe data inicial e data final");
      return;
    }

    try {
      await api.put(`/periodos/${editando.id}`, {
        dataInicio,
        dataFim,
      });

      setEditando(null);
      setCriando(false);
      setDataInicio("");
      setDataFim("");

      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao atualizar período");
    }
  }

  async function excluirPeriodo(id) {
    if (!window.confirm("Deseja realmente excluir este período?")) {
      return;
    }

    try {
      await api.delete(`/periodos/${id}`);
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao excluir período");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="config-page">
      <header className="config-header">
        <div>
          <p className="config-eyebrow">Configurações</p>
          <h2>Períodos</h2>
          <p className="config-subtitle">
            Organize os ciclos de vendas e mantenha as datas atualizadas.
          </p>
        </div>
        <div className="config-header-actions">
          <button className="btn-primary" onClick={() => setCriando(true)}>
            Novo período
          </button>
        </div>
      </header>

      {criando && (
        <section className="config-card config-panel">
          <h3>{editando ? "Editar período" : "Novo período"}</h3>

          <form
            className="config-form"
            onSubmit={(e) => {
              e.preventDefault();

              if (editando) {
                atualizarPeriodo();
              } else {
                salvarPeriodo();
              }
            }}
          >
            <div className="config-form-grid">
              <label>
                Data início
                <input
                  className="config-input"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required
                />
              </label>

              <label>
                Data fim
                <input
                  className="config-input"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  required
                />
              </label>
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
                  setDataInicio("");
                  setDataFim("");
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
                <th>Data início</th>
                <th>Data fim</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {periodos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="config-empty">
                    Nenhum período cadastrado
                  </td>
                </tr>
              ) : (
                periodos.map((p) => (
                  <tr key={p.id}>
                    <td>{formatarDataBR(p.dataInicio)}</td>
                    <td>{formatarDataBR(p.dataFim)}</td>
                    <td>
                      <div className="action-stack">
                        <button
                          className="btn-ghost"
                          onClick={() => {
                            setEditando(p);
                            setCriando(true);
                            setDataInicio(p.dataInicio.slice(0, 10));
                            setDataFim(p.dataFim.slice(0, 10));
                          }}
                        >
                          Editar
                        </button>

                        <button
                          className="btn-danger"
                          onClick={() => excluirPeriodo(p.id)}
                        >
                          Excluir
                        </button>
                      </div>
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
