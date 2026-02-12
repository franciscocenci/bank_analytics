import { useEffect, useMemo, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import api from "../services/api";
import preencherDatas from "../utils/preencherDatas";

export default function EvolucaoVendasChart({
  produto,
  dataInicio,
  dataFim,
  periodoId,
  comparacaoId,
  agenciaId,
}) {
  const [dados, setDados] = useState({
    lista: [],
    meta: 0,
    mensuracao: "volume",
  });
  const [loading, setLoading] = useState(false);

  const formatarValor = useCallback((valor, mensuracaoAtual) => {
    if (valor === null || valor === undefined || Number.isNaN(valor)) {
      return "0";
    }

    if (mensuracaoAtual === "quantidade") {
      return Math.round(Number(valor)).toLocaleString("pt-BR");
    }

    return (
      "R$ " +
      Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }, []);

  const maxValor = useMemo(() => {
    const maxLista = dados.lista.reduce((max, item) => {
      const valor = Number(item.valor);
      const comparacao = Number(item.comparacao);
      const valorSeguro = Number.isFinite(valor) ? valor : 0;
      const comparacaoSegura = Number.isFinite(comparacao) ? comparacao : 0;
      return Math.max(max, valorSeguro, comparacaoSegura);
    }, 0);

    const meta = Number(dados.meta) || 0;
    const metaComFolga = meta > 0 ? meta * 1.2 : 0;
    return Math.max(maxLista, metaComFolga);
  }, [dados.lista, dados.meta]);

  const carregarDados = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        const res = await api.get("/dashboard/evolucao-vendas", {
          params: {
            produto,
            periodoId,
            comparacaoId,
            agenciaId,
          },
          signal, // Aborta a requisição se o componente desmontar ou mudar
        });

        const {
          atual = [],
          comparacao: dadosComparacao = [],
          meta = 0,
          mensuracao = "volume",
        } = res.data;

        // 1. Centralizar todos os dados em um Map para evitar loops aninhados
        const mapa = new Map();

        // Processar período atual
        atual.forEach((p) => {
          const chave = p.dia.slice(0, 10);
          mapa.set(chave, {
            dia: chave,
            atual: Number(p.valor),
            comparacao: null,
          });
        });

        // Processar período de comparação
        dadosComparacao.forEach((p) => {
          const chave = p.dia.slice(0, 10);
          if (mapa.has(chave)) {
            mapa.get(chave).comparacao = Number(p.valor);
          } else {
            mapa.set(chave, {
              dia: chave,
              atual: null,
              comparacao: Number(p.valor),
            });
          }
        });

        // 2. Converter Map para Array e ordenar por data
        const dadosOrdenados = Array.from(mapa.values()).sort(
          (a, b) => new Date(a.dia) - new Date(b.dia),
        );

        // 3. Normalizar com a utilidade de preencher datas faltantes
        // Ajuste conforme a necessidade da sua função preencherDatas
        const dadosCompletos = preencherDatas(
          dataInicio,
          dataFim,
          dadosOrdenados.map((d) => ({
            dia: d.dia,
            valor: d.atual, // Valor principal para a função preencher
            comparacao: d.comparacao,
          })),
        );

        setDados({
          lista: dadosCompletos,
          meta: Number(meta),
          mensuracao,
        });
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Erro ao carregar gráfico de evolução:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [produto, dataInicio, dataFim, periodoId, comparacaoId, agenciaId],
  );

  useEffect(() => {
    if (!dataInicio || !dataFim) return;

    const controller = new AbortController();
    carregarDados(controller.signal);

    return () => controller.abort();
  }, [carregarDados, dataInicio, dataFim]);

  return (
    <div className="evolucao-chart">
      <h3 className="evolucao-chart-title">
        Evolução de Vendas - {produto || "Todos os Produtos"}
      </h3>

      {loading && (
        <div className="evolucao-chart-loading">Carregando dados...</div>
      )}

      <div className="evolucao-chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dados.lista}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#eee"
            />

            <XAxis
              dataKey="dia"
              type="category"
              tickFormatter={(value) => {
                if (!value) return "";
                const [ano, mes, dia] = value.split("-");
                return `${dia}/${mes}`;
              }}
              tick={{ fontSize: 12 }}
              minTickGap={10}
            />

            <YAxis
              domain={[0, maxValor]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatarValor(value, dados.mensuracao)}
            />

            <Tooltip
              labelFormatter={(value) => {
                const [ano, mes, dia] = value.split("-");
                return `Data: ${dia}/${mes}/${ano}`;
              }}
              formatter={(value) => formatarValor(value, dados.mensuracao)}
            />

            <Legend verticalAlign="top" height={36} />

            {/* Meta */}
            {dados.meta > 0 && (
              <ReferenceLine
                y={dados.meta}
                stroke="rgb(28, 216, 202)"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Meta: ${formatarValor(dados.meta, dados.mensuracao)}`,
                  position: "insideBottomRight",
                  fill: "rgb(28, 216, 202)",
                  fontSize: 12,
                }}
              />
            )}

            {/* Linha Período Comparado (Fundo) */}
            <Line
              type="monotone"
              dataKey="comparacao"
              stroke="#C0C0C0"
              strokeWidth={2}
              dot={false}
              name="Período Anterior"
              connectNulls={true}
            />

            {/* Linha Período Atual (Destaque) */}
            <Line
              type="monotone"
              dataKey="valor" // ou "atual", dependendo de como preencherDatas retorna
              stroke="#1890FF"
              strokeWidth={3}
              dot={{ r: 3, fill: "#1890FF" }}
              activeDot={{ r: 6 }}
              name="Período Atual"
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
