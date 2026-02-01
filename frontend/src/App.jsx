import Login from "./pages/Login";
import Importacao from "./pages/admin/Importacao";
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  const path = window.location.pathname;

  if (path === "/") return <Login />;

  if (path === "/admin") {
    return (
      <PrivateRoute>
        <Importacao />
      </PrivateRoute>
    );
  }

  return <Login />;
}
