import { NavLink, Outlet } from "react-router-dom";
import "./ConfiguracoesLayout.css";

export default function ConfiguracoesLayout() {
  return (
    <div className="config-container">
      <aside className="config-sidebar">
        <h3>Configurações</h3>

        <NavLink
          to="importacao"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Importação
        </NavLink>

        <NavLink
          to="agencias"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Agências
        </NavLink>

        <NavLink
          to="usuarios"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Usuários
        </NavLink>

        <NavLink
          to="periodos"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Períodos
        </NavLink>
      </aside>

      <section className="config-content">
        <Outlet />
      </section>
    </div>
  );
}
