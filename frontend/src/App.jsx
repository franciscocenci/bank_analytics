import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import PrivateRoute from "./routes/PrivateRoute";
import AdminLayout from "./layouts/AdminLayout";

import ConfiguracoesLayout from "./pages/admin/configuracoes/ConfiguracoesLayout";
import Importacao from "./pages/admin/configuracoes/Importacao";
import Agencias from "./pages/admin/configuracoes/Agencias";
import Usuarios from "./pages/admin/configuracoes/Usuarios";
import Periodos from "./pages/admin/configuracoes/Periodos";
import TrocarSenha from "./pages/TrocarSenha";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Área administrativa */}
        <Route
          path="/admin"
          element={
            <PrivateRoute adminOnly>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<h1>Dashboard</h1>} />

          <Route path="configuracoes" element={<ConfiguracoesLayout />}>
            <Route path="importacao" element={<Importacao />} />
            <Route path="agencias" element={<Agencias />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="periodos" element={<Periodos />} />
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
