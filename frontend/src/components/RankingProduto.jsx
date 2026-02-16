import { useMemo } from "react";

export default function RankingProduto({
  produto,
  periodoId,
  agenciaIdDestaque,
  rankingData,
}) {
  const dados = rankingData?.ranking || [];
  const mensuracao = rankingData?.mensuracao || "volume";

  const agenciaDestaque = useMemo(() => {
    if (!agenciaIdDestaque) return null;
    return Number(agenciaIdDestaque);
  }, [agenciaIdDestaque]);

  const topCinco = useMemo(() => dados.slice(0, 5), [dados]);

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
          {topCinco.map((ag, index) => (
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
