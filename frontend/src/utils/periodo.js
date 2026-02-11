// Converte YYYY-MM-DD para objeto simples (sem Date)
export function parsePeriodo(dataInicio, dataFim) {
  return {
    inicio: dataInicio.slice(0, 10),
    fim: dataFim.slice(0, 10),
  };
}

// Calcula diferença em dias (aproximada, sem timezone)
export function diasDoPeriodo(inicio, fim) {
  const i = inicio.split("-").map(Number);
  const f = fim.split("-").map(Number);

  const dataInicio = new Date(i[0], i[1] - 1, i[2]);
  const dataFim = new Date(f[0], f[1] - 1, f[2]);

  const diff = dataFim - dataInicio;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

// Verifica se dois períodos podem ser comparados
export function periodosComparaveis(p1, p2) {
  return diasDoPeriodo(p1.inicio, p1.fim) === diasDoPeriodo(p2.inicio, p2.fim);
}

// Label amigável
export function labelPeriodo(inicio, fim) {
  return `${inicio.slice(8, 10)}/${inicio.slice(5, 7)}/${inicio.slice(0, 4)}
   → ${fim.slice(8, 10)}/${fim.slice(5, 7)}/${fim.slice(0, 4)}`;
}
