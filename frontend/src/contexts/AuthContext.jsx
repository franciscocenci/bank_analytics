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

  async function login(email, senha) {
    try {
      const res = await api.post("/auth/login", { email, senha });

      console.log("Resposta do login:", res.data);

      // 🚨 CASO 1: senha provisória
      if (res.data.trocaSenha) {
        return {
          trocaSenha: true,
          user: res.data.user,
        };
      }

      // ✅ CASO 2: login normal
      const { token, user } = res.data;

      if (!token) {
        throw new Error("Token não recebido");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return { trocaSenha: false };
    } catch (err) {
      console.error("ERRO LOGIN:", err.response?.data || err.message);
      throw err;
    }
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
