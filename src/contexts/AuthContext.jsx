import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  authApi,
  tutorApi,
  getToken,
  setToken as saveToken,
  removeToken,
  setOnUnauthorizedCallback,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setTokenState(null);
  }, []);

  const loadUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const tutorData = await tutorApi.getMe();
      setUser(tutorData);
      setTokenState(currentToken);
    } catch (err) {
      console.warn("Sessão expirada ou inválida:", err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      logout();
    });
    loadUser();
  }, [loadUser, logout]);

  const login = async (email, senha) => {
    const res = await authApi.login({ email, senha });
    const receivedToken = res.token;
    saveToken(receivedToken);
    setTokenState(receivedToken);

    if (res.tutor) {
      setUser(res.tutor);
      return res.tutor;
    } else {
      const tutor = await tutorApi.getMe();
      setUser(tutor);
      return tutor;
    }
  };

  const register = async ({ nome, email, senha }) => {
    await tutorApi.register({ nome, email, senha });
    return await login(email, senha);
  };

  const updateProfile = async (dados) => {
    const updated = await tutorApi.updateMe(dados);
    setUser((prev) => ({ ...prev, ...updated }));
    return updated;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
    updateProfile,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
