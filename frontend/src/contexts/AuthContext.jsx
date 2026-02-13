import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session when a token exists.
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");

    if (token && userStorage) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      const parsedUser = JSON.parse(userStorage);
      if (parsedUser && parsedUser.AgenciaId && !parsedUser.agenciaId) {
        parsedUser.agenciaId = parsedUser.AgenciaId;
        delete parsedUser.AgenciaId;
      }
      setUser(parsedUser);
    }

    setLoading(false);
  }, []);

  async function login(email, senha) {
    try {
      const res = await api.post("/auth/login", { email, senha });

      // Temporary password flow.
      if (res.data.trocaSenha) {
        return {
          trocaSenha: true,
          user: res.data.user,
        };
      }

      // Normal login flow.
      const { token, user } = res.data;

      if (!token) {
        throw new Error("Token não recebido");
      }

      if (user && user.AgenciaId && !user.agenciaId) {
        user.agenciaId = user.AgenciaId;
        delete user.AgenciaId;
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

  // Clear session on logout.
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
