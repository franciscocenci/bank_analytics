import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Agencias() {
  const [agencias, setAgencias] = useState([]);

  const carregar = async () => {
    const res = await api.get("/agencias");
    setAgencias(res.data);
  };

  const excluir = async (id) => {
    if (!window.confirm("Excluir agência?")) return;
    await api.delete(`/agencias/${id}`);
    carregar();
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <h2>Agências</h2>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {agencias.map((a) => (
            <tr key={a.id}>
              <td>{a.codigo}</td>
              <td>{a.nome}</td>
              <td>
                <button onClick={() => alert("editar depois")}>Editar</button>
                <button onClick={() => excluir(a.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
