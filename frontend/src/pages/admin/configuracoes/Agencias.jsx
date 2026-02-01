import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function Agencias() {
  const [agencias, setAgencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const res = await api.get("/agencias");
      setAgencias(res.data);
    } catch (err) {
      alert("Erro ao carregar agências");
    } finally {
      setLoading(false);
    }
  }

  async function excluir(id, nome) {
    if (!window.confirm(`Deseja excluir a agência "${nome}"?`)) return;

    try {
      await api.delete(`/agencias/${id}`);
      carregar();
    } catch {
      alert("Erro ao excluir agência");
    }
  }

  function iniciarEdicao(agencia) {
    setEditando(agencia.id);
    setNomeEditado(agencia.nome);
  }

  function cancelarEdicao() {
    setEditando(null);
    setNomeEditado("");
  }

  async function salvarEdicao(id) {
    if (!nomeEditado.trim()) {
      alert("O nome não pode ficar vazio");
      return;
    }

    try {
      setSalvando(true);

      await api.put(`/agencias/${id}`, {
        nome: nomeEditado,
      });

      setEditando(null);
      setNomeEditado("");
      carregar();
    } catch {
      alert("Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <h2>Agências</h2>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {agencias.length === 0 ? (
              <tr>
                <td colSpan="3">Nenhuma agência cadastrada</td>
              </tr>
            ) : (
              agencias.map((a) => (
                <tr key={a.id}>
                  <td>{a.codigo}</td>
                  <td>
                    {editando === a.id ? (
                      <input
                        type="text"
                        value={nomeEditado}
                        onChange={(e) => setNomeEditado(e.target.value)}
                      />
                    ) : (
                      a.nome
                    )}
                  </td>
                  <td>
                    {editando === a.id ? (
                      <>
                        <button
                          onClick={() => salvarEdicao(a.id)}
                          disabled={salvando || nomeEditado === a.nome}
                        >
                          {salvando ? "Salvando..." : "Salvar"}
                        </button>
                        <button onClick={cancelarEdicao}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => iniciarEdicao(a)}>Editar</button>
                        <button onClick={() => excluir(a.id, a.nome)}>
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
