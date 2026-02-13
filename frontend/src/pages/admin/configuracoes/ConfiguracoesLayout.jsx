import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import "./ConfiguracoesLayout.css";

export default function ConfiguracoesLayout() {
  const { pendentes = 0 } = useOutletContext() || {};

  return (
    <div className="config-shell">
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
          <span className="config-link-with-badge">
            Usuários
            {pendentes > 0 && (
              <span className="config-badge">{pendentes}</span>
            )}
          </span>
        </NavLink>

        <NavLink
          to="periodos"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Períodos
        </NavLink>

        <NavLink
          to="produtos"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Produtos
        </NavLink>
      </aside>

        <section className="config-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
