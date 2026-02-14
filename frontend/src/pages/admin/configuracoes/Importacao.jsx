import { useEffect, useRef, useState } from "react";
import api from "../../../services/api";
import "./Importacao.css";

const estadoInicial = {
  status: "idle",
  percentual: 0,
  processadas: 0,
  total: 0,
  message: "",
  relatorio: {
    inseridos: 0,
    atualizados: 0,
    criadas: 0,
    ignorados: 0,
    erros: [],
  },
  error: null,
};

export default function Importacao() {
  const [file, setFile] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [progresso, setProgresso] = useState(estadoInicial);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const pollingRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  async function carregarHistorico(page = pagina, status = statusFiltro) {
    try {
      setCarregandoHistorico(true);
      const res = await api.get("/import/vendas/historico", {
        params: { limit: 6, page, status },
      });
      setHistorico(res.data?.items || []);
      setPagina(res.data?.page || 1);
      setTotalPaginas(res.data?.pages || 1);
    } catch (err) {
      console.error("Erro ao buscar histórico", err);
    } finally {
      setCarregandoHistorico(false);
    }
  }

  const iniciarPolling = (jobId) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const buscarStatus = async () => {
      try {
        const res = await api.get(`/import/vendas/status/${jobId}`);
        const payload = res.data;
        setProgresso(payload);
        setResultado(payload.relatorio || null);

        if (payload.status === "concluido") {
          setLoading(false);
          clearInterval(pollingRef.current);
        }

        if (payload.status === "erro") {
          setLoading(false);
          setErro(payload.message || "Erro ao importar planilha");
          clearInterval(pollingRef.current);
        }
      } catch (err) {
        setLoading(false);
        setErro("Falha ao acompanhar o progresso da importação");
        clearInterval(pollingRef.current);
      }
    };

    buscarStatus();
    pollingRef.current = setInterval(buscarStatus, 1000);
  };

  const enviar = async () => {
    setErro(null);
    setResultado(null);
    setProgresso(estadoInicial);

    if (!file) {
      setErro("Selecione um arquivo .xlsx antes de importar");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await api.post("/import/vendas", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      iniciarPolling(res.data.jobId);
      carregarHistorico(1, statusFiltro);
    } catch (err) {
      console.error(err);

      setLoading(false);
      setErro(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao importar planilha",
      );
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  useEffect(() => {
    carregarHistorico(1, statusFiltro);
  }, [statusFiltro]);

  return (
    <div className="importacao-page">
      <div className="importacao-card">
        <div className="importacao-header">
          <div>
            <p className="importacao-eyebrow">Configurações</p>
            <h2>Importar Planilha (.xlsx)</h2>
            <p className="importacao-subtitle">
              Acompanhe o progresso em tempo real e confira o resumo da
              importação.
            </p>
          </div>
          <div className="importacao-status">
            <span className={`status-pill status-${progresso.status}`}>
              {progresso.status === "processando" && "Importando"}
              {progresso.status === "concluido" && "Concluído"}
              {progresso.status === "erro" && "Erro"}
              {progresso.status === "idle" && "Pronto"}
            </span>
          </div>
        </div>

        <div className="importacao-form">
          <label className="file-label">
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <span>{file ? file.name : "Selecionar arquivo .xlsx"}</span>
          </label>

          <button onClick={enviar} disabled={loading}>
            {loading ? "Importando..." : "Iniciar importação"}
          </button>
        </div>

        <div className="importacao-progress">
          <div className="progress-info">
            <span>Progresso</span>
            <strong>{progresso.percentual}%</strong>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progresso.percentual}%` }}
            />
          </div>
          <p className="progress-meta">
            {progresso.processadas} de {progresso.total} linhas processadas
          </p>
        </div>

        {erro && <p className="importacao-erro">{erro}</p>}
      </div>

      {resultado && (
        <div className="importacao-resumo">
          <div className="resumo-grid">
            <div className="resumo-card">
              <span>Inseridos</span>
              <strong>{resultado.inseridos}</strong>
            </div>
            <div className="resumo-card">
              <span>Atualizados</span>
              <strong>{resultado.atualizados}</strong>
            </div>
            <div className="resumo-card">
              <span>Agências criadas</span>
              <strong>{resultado.criadas}</strong>
            </div>
            <div className="resumo-card">
              <span>Ignorados</span>
              <strong>{resultado.ignorados}</strong>
            </div>
          </div>

          {resultado.erros.length > 0 && (
            <div className="resumo-erros">
              <h3>Erros encontrados</h3>
              <div className="resumo-lista">
                {resultado.erros.map((item, index) => (
                  <div key={`${item.linha}-${index}`} className="resumo-item">
                    <strong>Linha {item.linha}:</strong> {item.erro}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultado.erros.length === 0 && (
            <div className="resumo-sucesso">
              <strong>Importação concluída com sucesso.</strong>
              <span>Todos os registros foram processados sem erros.</span>
            </div>
          )}
        </div>
      )}

      <section className="importacao-historico">
        <div className="historico-header">
          <h3>Histórico de importações</h3>
          <div className="historico-actions">
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="processando">Processando</option>
              <option value="concluido">Concluído</option>
              <option value="erro">Erro</option>
            </select>
            <button type="button" onClick={() => carregarHistorico()}>
              Atualizar
            </button>
          </div>
        </div>

        {carregandoHistorico ? (
          <p>Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <p>Nenhuma importação encontrada.</p>
        ) : (
          <div className="historico-grid">
            {historico.map((item) => (
              <div key={item.id} className="historico-card">
                <div className="historico-topo">
                  <span className={`status-pill status-${item.status}`}>
                    {item.status === "processando" && "Importando"}
                    {item.status === "concluido" && "Concluído"}
                    {item.status === "erro" && "Erro"}
                  </span>
                  <span className="historico-meta">
                    {item.processadas} / {item.total}
                  </span>
                </div>
                <strong>{item.message || "Importação"}</strong>
                {item.error && <p className="historico-erro">{item.error}</p>}
                <span className="historico-data">
                  {new Date(item.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="historico-paginacao">
            <button
              type="button"
              onClick={() => carregarHistorico(pagina - 1, statusFiltro)}
              disabled={pagina <= 1}
            >
              Anterior
            </button>
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => carregarHistorico(pagina + 1, statusFiltro)}
              disabled={pagina >= totalPaginas}
            >
              Próxima
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
