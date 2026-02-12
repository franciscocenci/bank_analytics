export default function IndicadorProduto({ produto, percentualTempo }) {
  if (!produto) return null;

  const percentual = Math.min(produto.atingimento, 100);
  const percentualTempoSeguro =
    typeof percentualTempo === "number" && !Number.isNaN(percentualTempo)
      ? percentualTempo
      : null;
  const estaAtrasado =
    percentualTempoSeguro !== null && percentual < percentualTempoSeguro;

  const formatar = (valor) => {
    if (produto.mensuracao === "quantidade") {
      return Math.round(Number(valor)).toLocaleString("pt-BR");
    }

    return (
      "R$ " +
      Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  return (
    <div className="indicador-card">
      <div className="indicador-header">
        <h3>{produto.produto}</h3>
      </div>

      <div className="indicador-body">
        <div className="indicador-barra">
          <div className="progress-container">
            <div className="progress-bg"></div>

            <div
              className="progress-fill"
              style={{ width: `${percentual}%` }}
            ></div>
          </div>
        </div>

        <div className="indicador-info">
          <div className="indicador-tabela">
            <span className="indicador-chave">Meta</span>
            <span className="indicador-valor">{formatar(produto.meta)}</span>

            <span className="indicador-chave">Realizado</span>
            <span className="indicador-valor">{formatar(produto.realizado)}</span>

            <span className="indicador-chave">Faltante</span>
            <span className="indicador-valor">{formatar(produto.faltante)}</span>

            <span className="indicador-chave indicador-destaque">
              Esforço diário
            </span>
            <span className="indicador-valor indicador-destaque">
              {formatar(produto.esforcoDiarioNecessario)}
            </span>
          </div>

          <span className="indicador-separador" aria-hidden="true" />
          <span
            className={`indicador-percentual${estaAtrasado ? " atrasado" : ""}`}
          >
            {percentual}%
          </span>
        </div>
      </div>
    </div>
  );
}
