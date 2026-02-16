import api from "./api";

export async function getGatewayStatus() {
  const response = await api.get("/status");
  return response.data;
}

export async function getDependenciesStatus() {
  const response = await api.get("/status/deps", {
    validateStatus: (status) => status >= 200 && status < 600,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error("Acesso negado");
    err.response = response;
    throw err;
  }

  return response.data;
}
