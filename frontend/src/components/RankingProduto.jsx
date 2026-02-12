import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function RankingProduto({
  produto,
  periodoId,
  agenciaIdDestaque,
}) {
  const [dados, setDados] = useState([]);
  const [mensuracao, setMensuracao] = useState("volume");

  const agenciaDestaque = useMemo(() => {
    if (!agenciaIdDestaque) return null;
    return Number(agenciaIdDestaque);
  }, [agenciaIdDestaque]);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get("/dashboard/ranking-agencias", {
          params: { produto, periodoId },
        });

        // pegamos apenas top 5
        setDados(res.data.ranking.slice(0, 5));
        setMensuracao(res.data.mensuracao || "volume");
      } catch (err) {
        console.error("Erro ao carregar ranking", produto, err);
      }
    }

    carregar();
  }, [produto, periodoId]);

  return (
    <div className="ranking-card">
      <h3>{produto}</h3>

      <table className="ranking-tabela">
        <thead>
          <tr>
            <th>#</th>
            <th>Agência</th>
            <th>Realizado</th>
          </tr>
        </thead>

        <tbody>
          {dados.map((ag, index) => (
            <tr
              key={ag.agencia.id}
              className={
                agenciaDestaque === ag.agencia.id ? "ranking-destaque" : ""
              }
            >
              <td>{ag.ranking || index + 1}</td>
              <td>{ag.agencia.nome}</td>
              <td>
                {mensuracao === "quantidade"
                  ? Math.round(ag.realizado).toLocaleString("pt-BR")
                  : "R$ " +
                    Number(ag.realizado).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
