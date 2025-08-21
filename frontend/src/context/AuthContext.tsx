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
    await fetch("http://localhost:3000/logout", {
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
