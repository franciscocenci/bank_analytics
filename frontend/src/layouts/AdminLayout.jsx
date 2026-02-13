import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "./AdminLayout.css";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendentes, setPendentes] = useState(0);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  useEffect(() => {
    let ativo = true;
    let intervalId;

    async function carregarPendentes() {
      if (user?.perfil !== "admin") return;

      try {
        const res = await api.get("/users/pendentes-count");
        if (ativo) {
          setPendentes(Number(res.data?.total) || 0);
        }
      } catch {
        if (ativo) {
          setPendentes(0);
        }
      }
    }

    carregarPendentes();
    intervalId = setInterval(carregarPendentes, 30000);

    return () => {
      ativo = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.perfil]);

  const estaEmConfiguracoes = location.pathname.startsWith("/admin/configuracoes");

  return (
    <div className="admin-container">
      {/* MENU LATERAL */}
      <aside className="admin-sidebar">
        <h2 className="logo">Sistema Bancário</h2>

        <div className="user-panel">
          <p className="user-panel-label">Usuário logado</p>
          <p className="user-panel-name">{user?.nome || "-"}</p>
          <p className="user-panel-agencia">
            {user?.agencia?.nome
              ? `Agência: ${user.agencia.nome}`
              : "Agência: -"}
          </p>
        </div>

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
              <span className="nav-link-with-badge">
                Configurações
                {pendentes > 0 && !estaEmConfiguracoes && (
                  <span className="nav-badge">{pendentes}</span>
                )}
              </span>
            </NavLink>
          )}
        </nav>

        <button className="logout" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      {/* CONTEÚDO */}
      <main className="admin-content">
        <Outlet context={{ pendentes }} />
      </main>
    </div>
  );
}
