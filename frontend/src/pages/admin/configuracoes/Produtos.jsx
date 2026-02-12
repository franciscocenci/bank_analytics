import { useEffect, useState } from "react";
import api from "../../../services/api";
import "./ConfiguracoesAdmin.css";

const labelMensuracao = {
  volume: "Volume (R$)",
  quantidade: "Quantidade",
};

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mensuracaoEditada, setMensuracaoEditada] = useState("volume");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const res = await api.get("/produtos");
      setProdutos(res.data || []);
    } catch (err) {
      alert("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  function iniciarEdicao(produto) {
    setEditando(produto.id);
    setMensuracaoEditada(produto.mensuracao || "volume");
  }

  function cancelarEdicao() {
    setEditando(null);
    setMensuracaoEditada("volume");
  }

  async function salvarEdicao(id) {
    try {
      setSalvando(true);
      await api.put(`/produtos/${id}`, {
        mensuracao: mensuracaoEditada,
      });
      setEditando(null);
      setMensuracaoEditada("volume");
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao salvar produto");
    } finally {
      setSalvando(false);
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
          <h2>Produtos</h2>
          <p className="config-subtitle">
            Defina se o produto e mensurado por volume financeiro ou por
            quantidade.
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
                <th>Produto</th>
                <th>Mensuração</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="config-empty">
                    Nenhum produto cadastrado
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.nome}</td>
                    <td>
                      {editando === produto.id ? (
                        <select
                          className="config-select"
                          value={mensuracaoEditada}
                          onChange={(e) =>
                            setMensuracaoEditada(e.target.value)
                          }
                        >
                          <option value="volume">Volume (R$)</option>
                          <option value="quantidade">Quantidade</option>
                        </select>
                      ) : (
                        labelMensuracao[produto.mensuracao] || "Volume (R$)"
                      )}
                    </td>
                    <td>
                      {editando === produto.id ? (
                        <div className="action-stack">
                          <button
                            className="btn-primary"
                            onClick={() => salvarEdicao(produto.id)}
                            disabled={
                              salvando ||
                              mensuracaoEditada === produto.mensuracao
                            }
                          >
                            {salvando ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={cancelarEdicao}
                            disabled={salvando}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-ghost"
                          onClick={() => iniciarEdicao(produto)}
                        >
                          Editar
                        </button>
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
