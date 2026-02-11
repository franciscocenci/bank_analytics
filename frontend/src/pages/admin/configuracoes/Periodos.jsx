import { useEffect, useState } from "react";
import api from "../../../services/api";
import { formatarDataBR } from "../../../utils/date";

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
    <div>
      <h2>Períodos</h2>

      <button onClick={() => setCriando(true)}>Novo Período</button>

      {criando && (
        <div style={{ margin: "20px 0" }}>
          <h3>{editando ? "Editar Período" : "Novo Período"}</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (editando) {
                atualizarPeriodo();
              } else {
                salvarPeriodo();
              }
            }}
          >
            <label>Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              required
            />

            <label>Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              required
            />

            <br />
            <br />

            <button type="submit">{editando ? "Atualizar" : "Salvar"}</button>

            <button
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
          </form>
        </div>
      )}

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Data Início</th>
              <th>Data Fim</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {periodos.length === 0 ? (
              <tr>
                <td colSpan="3">Nenhum período cadastrado</td>
              </tr>
            ) : (
              periodos.map((p) => (
                <tr key={p.id}>
                  <td>{formatarDataBR(p.dataInicio)}</td>
                  <td>{formatarDataBR(p.dataFim)}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditando(p);
                        setCriando(true);
                        setDataInicio(p.dataInicio.slice(0, 10));
                        setDataFim(p.dataFim.slice(0, 10));
                      }}
                    >
                      Editar
                    </button>

                    <button onClick={() => excluirPeriodo(p.id)}>
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
