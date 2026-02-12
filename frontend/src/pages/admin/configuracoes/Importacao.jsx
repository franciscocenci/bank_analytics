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
  const sourceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
      }
    };
  }, []);

  const iniciarSSE = (jobId) => {
    const baseURL = api.defaults.baseURL || "";
    const token = localStorage.getItem("token");
    const url = `${baseURL}/import/vendas/progresso/${jobId}?token=${encodeURIComponent(
      token || "",
    )}`;

    if (sourceRef.current) {
      sourceRef.current.close();
    }

    const source = new EventSource(url);
    sourceRef.current = source;

    source.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      setProgresso(payload);
      setResultado(payload.relatorio || null);

      if (payload.status === "concluido") {
        setLoading(false);
        source.close();
      }

      if (payload.status === "erro") {
        setLoading(false);
        setErro(payload.message || "Erro ao importar planilha");
        source.close();
      }
    };

    source.onerror = () => {
      setLoading(false);
      setErro("Falha ao acompanhar o progresso da importação");
      source.close();
    };
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
      iniciarSSE(res.data.jobId);
    } catch (err) {
      console.error(err);

      setErro(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao importar planilha",
      );
    } finally {
      setLoading(false);
    }
  };

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
    </div>
  );
}
