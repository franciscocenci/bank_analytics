import { useState } from "react";
import api from "../../services/api";

export default function Importacao() {
  const [file, setFile] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const enviar = async () => {
    setErro(null);
    setResultado(null);

    if (!file) {
      setErro("Selecione um arquivo .xlsx antes de importar");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await api.post("/import/vendas", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResultado(res.data);
    } catch (err) {
      console.error(err);

      setErro(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao importar planilha",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2>Importar Planilha (.xlsx)</h2>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={enviar} disabled={loading}>
        {loading ? "Importando..." : "Importar"}
      </button>

      {erro && (
        <p style={{ color: "red", marginTop: 16 }}>
          <strong>{erro}</strong>
        </p>
      )}

      {resultado && (
        <pre style={{ marginTop: 16 }}>
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}
    </div>
  );
}
