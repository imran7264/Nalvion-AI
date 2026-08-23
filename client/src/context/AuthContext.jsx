import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("nalvion_token", token);

    setUser(user);

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("nalvion_token", token);

    setUser(user);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("nalvion_token");
    setUser(null);
  };

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("nalvion_token");

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/auth/me");

      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem("nalvion_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser()
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);