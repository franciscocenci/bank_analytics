import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./AdminLayout.css";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="admin-container">
      {/* MENU LATERAL */}
      <aside className="admin-sidebar">
        <h2 className="logo">Sistema Bancário</h2>

        <nav>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>

          {user?.perfil === "admin" && (
            <NavLink
              to="/admin/configuracoes"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Configurações
            </NavLink>
          )}
        </nav>

        <button className="logout" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      {/* CONTEÚDO */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
