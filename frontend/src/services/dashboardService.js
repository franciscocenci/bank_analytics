import api from "./api";

export async function getResumoAtual() {
  const response = await api.get("/dashboard/resumo-atual");
  return response.data;
}
