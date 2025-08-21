import { createContext } from "react";
import type { ReactNode } from "react";
import { useUser } from "./useUser";

interface AuthContextType {
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { clearUser } = useUser();
  const logout = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    clearUser();
  };
  return (
    <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
