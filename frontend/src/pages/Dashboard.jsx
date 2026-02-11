import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import RankingProduto from "../components/RankingProduto";
import IndicadorProduto from "../components/IndicadorProduto";
import EvolucaoVendasChart from "../components/EvolucaoVendasChart";
import "../styles/dashboard.css";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === "admin";
  const [resumo, setResumo] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoAtualId, setPeriodoAtualId] = useState("");
  const [periodoEvolucaoId, setPeriodoEvolucaoId] = useState("");
  const [periodoComparacaoId, setPeriodoComparacaoId] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [agencias, setAgencias] = useState([]);
  const [agenciaSelecionada, setAgenciaSelecionada] = useState("todas");

  const periodoAtual = periodos.find((p) => String(p.id) === String(periodoAtualId));
  const periodoEvolucao = periodos.find(
    (p) => String(p.id) === String(periodoEvolucaoId),
  );

  function formatarValor(produto, valor) {
    const produtosEmUnidade = [
      "Cartão de Crédito",
      "Cartao de Credito",
      "Cartões",
    ];

    if (produtosEmUnidade.includes(produto)) {
      return Math.round(valor).toLocaleString("pt-BR");
    }

    return (
      "R$ " +
      Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function formatarData(dataISO) {
    if (!dataISO) return "";

    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function labelPeriodo(periodo) {
    if (!periodo) return "";
    return `${semestreKey(periodo)} (${formatarData(periodo.dataInicio)} até ${formatarData(periodo.dataFim)})`;
  }

  function semestreKey(periodo) {
    if (!periodo?.dataInicio) return "";
    const inicio = new Date(`${periodo.dataInicio}T00:00:00`);
    const ano = inicio.getFullYear();
    const semestre = inicio.getMonth() < 6 ? 1 : 2;
    return `${ano}-${semestre}`;
  }

  function semestreNumero(periodo) {
    if (!periodo?.dataInicio) return null;
    const inicio = new Date(`${periodo.dataInicio}T00:00:00`);
    return inicio.getMonth() < 6 ? 1 : 2;
  }

  function labelPeriodoCabecalho(periodo) {
    if (!periodo?.dataInicio || !periodo?.dataFim) return "";
    const inicio = new Date(`${periodo.dataInicio}T00:00:00`);
    const fim = new Date(`${periodo.dataFim}T00:00:00`);
    const ano = inicio.getFullYear();
    const inicioTrimestre = Math.floor(inicio.getMonth() / 3);
    const fimTrimestre = Math.floor(fim.getMonth() / 3);

    if (inicioTrimestre === fimTrimestre) {
      return `${inicioTrimestre + 1}º trimestre de ${ano}`;
    }

    const semestre = inicio.getMonth() < 6 ? 1 : 2;
    return `${semestre}º semestre de ${ano}`;
  }

  const comparacoesDisponiveis = useMemo(() => {
    if (!periodoAtual) return [];
    const semestreAtual = semestreNumero(periodoAtual);
    const inicioAtual = new Date(`${periodoAtual.dataInicio}T00:00:00`);
    return periodos.filter(
      (p) =>
        semestreNumero(p) === semestreAtual &&
        String(p.id) !== String(periodoAtual.id) &&
        new Date(`${p.dataInicio}T00:00:00`) < inicioAtual,
    );
  }, [periodos, periodoAtual]);

  useEffect(() => {
    async function carregarPeriodos() {
      try {
        const res = await api.get("/dashboard/periodos");
        const lista = res.data || [];
        setPeriodos(lista);

        if (lista.length > 0) {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const atual = lista.find((p) => {
            const inicio = new Date(`${p.dataInicio}T00:00:00`);
            const fim = new Date(`${p.dataFim}T00:00:00`);
            return inicio <= hoje && fim >= hoje;
          });

          const selecionado = atual || lista[0];
          const periodoId = String(selecionado.id);
          setPeriodoAtualId(periodoId);
          setPeriodoEvolucaoId(periodoId);
        }
      } catch (err) {
        console.error("Erro ao buscar períodos:", err);
      }
    }

    carregarPeriodos();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    async function carregarAgencias() {
      try {
        const res = await api.get("/agencias");
        setAgencias(res.data || []);
      } catch (err) {
        console.error("Erro ao buscar agências:", err);
      }
    }

    carregarAgencias();
  }, [isAdmin]);

  useEffect(() => {
    if (!periodoAtualId) return;

    async function carregarProdutos() {
      try {
        const res = await api.get("/dashboard/produtos-ativos", {
          params: { periodoId: periodoAtualId },
        });
        const lista = res.data || [];
        setProdutos(lista);

        if (!lista.includes(produtoSelecionado)) {
          setProdutoSelecionado(lista[0] || "");
        }
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      }
    }

    carregarProdutos();
  }, [periodoAtualId]);

  useEffect(() => {
    if (!periodoAtualId) return;

    async function carregarResumo() {
      try {
        const res = await api.get("/dashboard/resumo-atual", {
          params: {
            periodoId: periodoAtualId,
            agenciaId: isAdmin ? agenciaSelecionada : undefined,
          },
        });
        setResumo(res.data);
      } catch (err) {
        console.error("Erro ao carregar dashboard", err);
      }
    }

    carregarResumo();
  }, [periodoAtualId, agenciaSelecionada, isAdmin]);


  const diasTotais = resumo?.periodo?.diasTotais ?? 0;
  const diasDecorridos = resumo?.periodo?.diasDecorridos ?? 0;
  const percentualDias = diasTotais
    ? Math.min(100, Math.max(0, (diasDecorridos / diasTotais) * 100))
    : 0;

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Dashboard</h1>

      {resumo && (
        <>
          <section className="dashboard-section">
            <h2>Ranking de Agências por Produto</h2>

            <div className="ranking-grid">
              {produtos.map((p) => (
                <RankingProduto
                  key={p}
                  produto={p}
                  periodoId={periodoAtualId}
                  agenciaIdDestaque={user?.agenciaId}
                />
              ))}
            </div>

          </section>

          <section className="dashboard-section">
            <h2>Gráfico de Evolução de Vendas</h2>

            <div className="dashboard-filtros">
              <div>
                <label>Período atual (fixo)</label>
                <select value={periodoAtualId || ""} disabled>
                  {periodoAtual && (
                    <option value={periodoAtual.id}>
                      {labelPeriodo(periodoAtual)}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label>Selecione o período de comparação</label>
                <select
                  value={periodoComparacaoId || ""}
                  onChange={(e) => setPeriodoComparacaoId(e.target.value)}
                  disabled={!periodoAtual}
                >
                  <option value="">Sem comparação</option>
                  {comparacoesDisponiveis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {labelPeriodo(p)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Selecione o produto</label>
                <select
                  value={produtoSelecionado || ""}
                  onChange={(e) => setProdutoSelecionado(e.target.value)}
                  disabled={produtos.length === 0}
                >
                  {produtos.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label>Selecione a agência</label>
                  <select
                    value={agenciaSelecionada}
                    onChange={(e) => setAgenciaSelecionada(e.target.value)}
                  >
                    <option value="todas">Todas as agências</option>
                    {agencias.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {produtoSelecionado && periodoAtual && (
              <EvolucaoVendasChart
                produto={produtoSelecionado}
                dataInicio={periodoAtual.dataInicio}
                dataFim={periodoAtual.dataFim}
                periodoId={periodoAtual.id}
                comparacaoId={periodoComparacaoId || null}
                agenciaId={isAdmin ? agenciaSelecionada : undefined}
              />
            )}
          </section>

          <section className="dashboard-section">
            <h2>Resumo do Período Atual</h2>

            <div className="dashboard-periodo-header">
              <p className="dashboard-periodo-label">
                Período: {labelPeriodoCabecalho(resumo.periodo)} ({" "}
                {formatarData(resumo.periodo.dataInicio)} até{" "}
                {formatarData(resumo.periodo.dataFim)})
              </p>

              <div className="dashboard-periodo-progresso">
                <div className="progress-container">
                  <div
                    className="progress-fill progress-tempo"
                    style={{
                      width: `${percentualDias.toFixed(1)}%`,
                    }}
                  />
                  <span className="progress-label">
                    {percentualDias.toFixed(0)}% do período
                  </span>
                </div>
                <p className="dashboard-periodo-dias">
                  Dias decorridos: {diasDecorridos} / {diasTotais}
                </p>
              </div>
            </div>

            <div className="grafico-grid">
              {resumo.produtos.map((p, i) => (
                <IndicadorProduto key={i} produto={p} />
              ))}
            </div>

          </section>
        </>
      )}
    </div>
  );
}
