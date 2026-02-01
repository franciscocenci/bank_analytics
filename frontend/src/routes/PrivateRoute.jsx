export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const perfil = localStorage.getItem("perfil");

  if (!token) {
    window.location.href = "/";
    return null;
  }

  if (perfil !== "admin") {
    return <p>Acesso restrito</p>;
  }

  return children;
}
