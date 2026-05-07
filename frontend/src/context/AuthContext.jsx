import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("skillExchangeToken"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        localStorage.removeItem("skillExchangeToken");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const authenticate = async (endpoint, payload) => {
    const { data } = await api.post(endpoint, payload);
    localStorage.setItem("skillExchangeToken", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = (payload) => authenticate("/auth/login", payload);
  const signup = (payload) => authenticate("/auth/signup", payload);

  const logout = () => {
    localStorage.removeItem("skillExchangeToken");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, setUser, token, loading, login, signup, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
