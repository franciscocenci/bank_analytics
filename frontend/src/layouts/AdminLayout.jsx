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
  const [configOpen, setConfigOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const isAdmin = user?.perfil === "admin";
  const isGerente = user?.perfil === "gerente";
  const isConfigRoute = location.pathname.startsWith("/admin/configuracoes");
  const isDashboardRoute = location.pathname.startsWith("/admin/dashboard");
  const dashboardActiveId = isDashboardRoute
    ? location.hash.replace("#", "")
    : "";
  const configDefaultRoute = isAdmin
    ? "/admin/configuracoes/importacao"
    : "/admin/configuracoes/usuarios";
  const configMenuOpen = configOpen || isConfigRoute;
  const dashboardMenuOpen = dashboardOpen || isDashboardRoute;

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

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    const container = document.querySelector(".admin-content");
    if (!el || !container) return;

    const inicio = container.scrollTop;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const destino = elRect.top - containerRect.top + container.scrollTop - 16;
    const duracao = 700;
    let inicioTempo = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animar = (tempo) => {
      if (inicioTempo === null) inicioTempo = tempo;
      const progresso = Math.min((tempo - inicioTempo) / duracao, 1);
      const fator = easeOutCubic(progresso);
      container.scrollTop = inicio + (destino - inicio) * fator;
      if (progresso < 1) {
        requestAnimationFrame(animar);
      }
    };

    requestAnimationFrame(animar);
  };

  const irParaGrafico = (id) => {
    setDashboardOpen(true);
    setConfigOpen(false);

    if (isDashboardRoute) {
      const hashAtual = location.hash.replace("#", "");
      if (hashAtual === id) {
        scrollToSection(id);
        return;
      }
    }

    navigate(`/admin/dashboard#${id}`);
  };

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
          <div className={`nav-group ${dashboardMenuOpen ? "open" : ""}`}>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => {
                setConfigOpen(false);
                setDashboardOpen(true);
              }}
            >
              Dashboard
            </NavLink>

            <div
              className={`nav-submenu ${dashboardMenuOpen ? "open" : ""}`}
              aria-hidden={!dashboardMenuOpen}
            >
              <button
                type="button"
                className={`nav-subitem nav-subitem-button${
                  dashboardActiveId === "grafico-ranking" ? " active" : ""
                }`}
                onClick={() => irParaGrafico("grafico-ranking")}
              >
                Ranking
              </button>
              <button
                type="button"
                className={`nav-subitem nav-subitem-button${
                  dashboardActiveId === "grafico-evolucao" ? " active" : ""
                }`}
                onClick={() => irParaGrafico("grafico-evolucao")}
              >
                Evolução
              </button>
              <button
                type="button"
                className={`nav-subitem nav-subitem-button${
                  dashboardActiveId === "grafico-resumo" ? " active" : ""
                }`}
                onClick={() => irParaGrafico("grafico-resumo")}
              >
                Resumo
              </button>
            </div>
          </div>

          {(isAdmin || isGerente) && (
            <div className={`nav-group ${configMenuOpen ? "open" : ""}`}>
              <button
                type="button"
                className={`nav-toggle${isConfigRoute ? " active" : ""}`}
                onClick={() => {
                  const next = !configMenuOpen;
                  setConfigOpen(next);
                  if (next) {
                    setDashboardOpen(false);
                  }
                  if (next && !isConfigRoute) {
                    navigate(configDefaultRoute);
                  }
                }}
              >
                <span className="nav-link-with-badge">
                  Configurações
                  {isAdmin && pendentes > 0 && (
                    <span className="nav-badge">{pendentes}</span>
                  )}
                </span>
              </button>

              <div
                className={`nav-submenu ${configMenuOpen ? "open" : ""}`}
                aria-hidden={!configMenuOpen}
              >
                  {isAdmin && (
                    <NavLink
                      to="/admin/configuracoes/importacao"
                      className={({ isActive }) =>
                        isActive ? "nav-subitem active" : "nav-subitem"
                      }
                    >
                      Importação
                    </NavLink>
                  )}
                  {isAdmin && (
                    <NavLink
                      to="/admin/configuracoes/agencias"
                      className={({ isActive }) =>
                        isActive ? "nav-subitem active" : "nav-subitem"
                      }
                    >
                      Agências
                    </NavLink>
                  )}
                  <NavLink
                    to="/admin/configuracoes/usuarios"
                    className={({ isActive }) =>
                      isActive ? "nav-subitem active" : "nav-subitem"
                    }
                  >
                    <span className="nav-link-with-badge">
                      Usuários
                      {isAdmin && pendentes > 0 && (
                        <span className="nav-badge">{pendentes}</span>
                      )}
                    </span>
                  </NavLink>
                  {isAdmin && (
                    <NavLink
                      to="/admin/configuracoes/periodos"
                      className={({ isActive }) =>
                        isActive ? "nav-subitem active" : "nav-subitem"
                      }
                    >
                      Períodos
                    </NavLink>
                  )}
                  {isAdmin && (
                    <NavLink
                      to="/admin/configuracoes/produtos"
                      className={({ isActive }) =>
                        isActive ? "nav-subitem active" : "nav-subitem"
                      }
                    >
                      Produtos
                    </NavLink>
                  )}
                  {isAdmin && (
                    <NavLink
                      to="/admin/configuracoes/status-sistema"
                      className={({ isActive }) =>
                        isActive ? "nav-subitem active" : "nav-subitem"
                      }
                    >
                      Saúde do Sistema
                    </NavLink>
                  )}
              </div>
            </div>
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
