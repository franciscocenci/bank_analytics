import { useEffect, useState } from "react";
import { getDependenciesStatus, getGatewayStatus } from "../../../services/statusService";
import "./ConfiguracoesAdmin.css";

function formatDuration(value) {
  if (typeof value !== "number") return "-";
  return `${value} ms`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function getStatusClass(ok) {
  return ok ? "status-pill status-ativo" : "status-pill status-pendente";
}

export default function StatusSistema() {
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [depsStatus, setDepsStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function carregar({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const [gateway, deps] = await Promise.all([
        getGatewayStatus(),
        getDependenciesStatus(),
      ]);

      setGatewayStatus(gateway);
      setDepsStatus(deps);
    } catch (err) {
      setError(err.response?.data?.error || "Não foi possível carregar o status do sistema.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    let intervalId;

    async function loadFirst() {
      if (!mounted) return;
      await carregar();
    }

    loadFirst();
    intervalId = setInterval(() => {
      if (mounted) {
        carregar({ silent: true });
      }
    }, 30000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const checks = depsStatus?.checks || [];

  return (
    <div className="config-page">
      <header className="config-header">
        <div>
          <p className="config-eyebrow">Monitoramento</p>
          <h2>Saúde do Sistema</h2>
          <p className="config-subtitle">
            Acompanhe gateway, serviços internos e banco em tempo real.
          </p>
        </div>

        <div className="config-header-actions">
          <button className="btn-secondary" onClick={() => carregar()} disabled={loading || refreshing}>
            {refreshing ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </header>

      <section className="config-card">
        {loading ? (
          <p>Carregando status...</p>
        ) : error ? (
          <p className="config-empty">{error}</p>
        ) : (
          <>
            <div className="config-panel">
              <h3>Gateway</h3>
              <div className="action-stack">
                <span className={getStatusClass(gatewayStatus?.status === "ok")}>Gateway: {gatewayStatus?.status === "ok" ? "Online" : "Instável"}</span>
                <span className="status-pill status-pill-info">Serviço: {gatewayStatus?.service || "-"}</span>
                <span className="status-pill status-pill-info">Ambiente: {gatewayStatus?.env || "-"}</span>
                <span className="status-pill status-pill-info">Atualizado em: {formatDate(gatewayStatus?.timestamp)}</span>
              </div>
            </div>

            <table className="config-table">
              <thead>
                <tr>
                  <th>Dependência</th>
                  <th>Status</th>
                  <th>HTTP</th>
                  <th>Latência</th>
                  <th>Erro</th>
                </tr>
              </thead>
              <tbody>
                {checks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="config-empty">
                      Sem dados de dependências.
                    </td>
                  </tr>
                ) : (
                  checks.map((check) => (
                    <tr key={check.service}>
                      <td>{check.service}</td>
                      <td>
                        <span className={getStatusClass(check.ok)}>
                          {check.ok ? "Online" : "Falha"}
                        </span>
                      </td>
                      <td>{check.statusCode || "-"}</td>
                      <td>{formatDuration(check.durationMs)}</td>
                      <td>{check.error || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
}
