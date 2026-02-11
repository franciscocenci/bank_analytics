export default function preencherDatas(dataInicio, dataFim, vendas) {
  const mapaValor = new Map();
  const mapaComparacao = new Map();

  // guarda valores vindos do backend
  vendas.forEach((v) => {
    const dia = new Date(v.dia).toISOString().slice(0, 10);
    if (v.valor !== null && v.valor !== undefined) {
      mapaValor.set(dia, Number(v.valor));
    }
    if (v.comparacao !== null && v.comparacao !== undefined) {
      mapaComparacao.set(dia, Number(v.comparacao));
    }
  });

  const resultado = [];
  let acumulado = null;
  let acumuladoComparacao = null;

  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    const diaISO = d.toISOString().slice(0, 10);

    if (mapaValor.has(diaISO)) {
      acumulado = mapaValor.get(diaISO);
    } else {
      acumulado = null;
    }

    if (mapaComparacao.has(diaISO)) {
      acumuladoComparacao = mapaComparacao.get(diaISO);
    } else {
      acumuladoComparacao = null;
    }

    resultado.push({
      dia: diaISO,
      valor: acumulado,
      comparacao: acumuladoComparacao,
    });
  }

  return resultado;
}
