import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import PrivateRoute from "./routes/PrivateRoute";
import AdminLayout from "./layouts/AdminLayout";
import ConfiguracoesLayout from "./pages/admin/configuracoes/ConfiguracoesLayout";
import Importacao from "./pages/admin/configuracoes/Importacao";
import Agencias from "./pages/admin/configuracoes/Agencias";
import Usuarios from "./pages/admin/configuracoes/Usuarios";
import Periodos from "./pages/admin/configuracoes/Periodos";
import Produtos from "./pages/admin/configuracoes/Produtos";
import StatusSistema from "./pages/admin/configuracoes/StatusSistema";
import TrocarSenha from "./pages/TrocarSenha";
import Dashboard from "./pages/Dashboard";
import CriarConta from "./pages/CriarConta";
import EsqueciSenha from "./pages/EsqueciSenha";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/criar-conta" element={<CriarConta />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />

        {/* Área administrativa */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="configuracoes"
            element={
              <PrivateRoute allowedRoles={["admin", "gerente"]}>
                <ConfiguracoesLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="usuarios" replace />} />
            <Route
              path="importacao"
              element={
                <PrivateRoute adminOnly>
                  <Importacao />
                </PrivateRoute>
              }
            />
            <Route
              path="agencias"
              element={
                <PrivateRoute adminOnly>
                  <Agencias />
                </PrivateRoute>
              }
            />
            <Route
              path="usuarios"
              element={
                <PrivateRoute allowedRoles={["admin", "gerente"]}>
                  <Usuarios />
                </PrivateRoute>
              }
            />
            <Route
              path="periodos"
              element={
                <PrivateRoute adminOnly>
                  <Periodos />
                </PrivateRoute>
              }
            />
            <Route
              path="produtos"
              element={
                <PrivateRoute adminOnly>
                  <Produtos />
                </PrivateRoute>
              }
            />
            <Route
              path="status-sistema"
              element={
                <PrivateRoute adminOnly>
                  <StatusSistema />
                </PrivateRoute>
              }
            />
          </Route>
        </Route>
        {/* Trocar senha */}
        <Route path="/trocar-senha" element={<TrocarSenha />} />

        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
