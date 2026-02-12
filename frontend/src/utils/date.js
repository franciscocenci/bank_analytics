// Converte "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss" para "DD/MM/YYYY"
export function formatarDataBR(data) {
  if (!data) return "";

  const dataLimpa = data.slice(0, 10); // garante YYYY-MM-DD
  const [ano, mes, dia] = dataLimpa.split("-");

  return `${dia}/${mes}/${ano}`;
}

function pad2(valor) {
  return String(valor).padStart(2, "0");
}

export function formatarDataHoraBR(data) {
  if (!data) return "";

  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return "";

  const dia = pad2(dataObj.getDate());
  const mes = pad2(dataObj.getMonth() + 1);
  const ano = dataObj.getFullYear();
  const horas = pad2(dataObj.getHours());
  const minutos = pad2(dataObj.getMinutes());

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

export function tempoRelativo(data) {
  if (!data) return "";

  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return "";

  const agora = new Date();
  let diff = Math.floor((agora - dataObj) / 1000);

  if (diff < 5) return "agora";
  if (diff < 0) diff = 0;

  const unidades = [
    { nome: "ano", segundos: 60 * 60 * 24 * 365 },
    { nome: "mes", segundos: 60 * 60 * 24 * 30 },
    { nome: "dia", segundos: 60 * 60 * 24 },
    { nome: "hora", segundos: 60 * 60 },
    { nome: "minuto", segundos: 60 },
    { nome: "segundo", segundos: 1 },
  ];

  for (const unidade of unidades) {
    if (diff >= unidade.segundos) {
      const valor = Math.floor(diff / unidade.segundos);
      const sufixo = valor === 1 ? unidade.nome : `${unidade.nome}s`;
      return `há ${valor} ${sufixo}`;
    }
  }

  return "agora";
}
