// Converte "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss" para "DD/MM/YYYY"
export function formatarDataBR(data) {
  if (!data) return "";

  const dataLimpa = data.slice(0, 10); // garante YYYY-MM-DD
  const [ano, mes, dia] = dataLimpa.split("-");

  return `${dia}/${mes}/${ano}`;
}
