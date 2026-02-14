import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({
  children,
  adminOnly = false,
  allowedRoles = null,
}) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.perfil !== "admin") {
    return <p>Acesso restrito</p>;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(user.perfil)) {
    return <p>Acesso restrito</p>;
  }

  return children;
}
