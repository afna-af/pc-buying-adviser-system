import { createContext, useContext, useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // loading state
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("rigs_token");

    if (!token) {
      setUser(null);
      return;
    }

    api
      .get("/auth/me")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem("rigs_token");
        setUser(null);
      });
  }, []);

  const login = async (email, password) => {
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      localStorage.setItem("rigs_token", data.token);
      setUser(data.user);

      return true;
    } catch (e) {
      setError(formatApiError(e?.response?.data?.detail) || e.message);

      return false;
    }
  };

  const register = async (email, password, name) => {
    setError("");

    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
      });

      const data = response.data;

      localStorage.setItem("rigs_token", data.token);
      setUser(data.user);

      return true;
    } catch (e) {
      setError(formatApiError(e?.response?.data?.detail) || e.message);

      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("rigs_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
