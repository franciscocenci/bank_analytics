import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restaura sessão (apenas se existir)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");

    if (token && userStorage) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(JSON.parse(userStorage));
    }

    setLoading(false);
  }, []);

  // 🔐 Login
  async function login(email, senha) {
    const res = await api.post("/auth/login", { email, senha });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
  }

  // 🚪 Logout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete api.defaults.headers.Authorization;
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
