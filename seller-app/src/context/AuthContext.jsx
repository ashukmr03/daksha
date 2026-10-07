import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sakhi_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then(res => setSeller(res.data))
      .catch(() => localStorage.removeItem("sakhi_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    localStorage.setItem("sakhi_token", res.data.token);
    setSeller(res.data.seller);
    return res.data.seller;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    localStorage.setItem("sakhi_token", res.data.token);
    setSeller(res.data.seller);
    return res.data.seller;
  };

  const updateSeller = (updated) => setSeller(updated);

  const logout = () => {
    localStorage.removeItem("sakhi_token");
    setSeller(null);
  };

  return (
    <AuthContext.Provider value={{ seller, setSeller, login, register, logout, loading, updateSeller }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
