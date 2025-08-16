import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface UserContextType {
  admissionNo: string | null;
  setAdmissionNo: (no: string | null) => void;
  userID: string | null;
  setUserID: (id: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [admissionNo, setAdmissionNo] = useState<string | null>(null);

  const [userID, setUserID] = useState<string | null>(null);

  const fetchAdmissionNo = async () => {
    const meRes = await fetch("http://localhost:3000/auth/me", {
      method: "GET",
      credentials: "include",
    });
    // console.log(meRes);
    if (!meRes.ok) throw new Error("Unable to fetch user info");

    const meData = await meRes.json();
    setAdmissionNo(meData.admissionNo);
    setUserID(meData.userId);
  };

  useEffect(() => {
    fetchAdmissionNo();
  }, []);

  return (
    <UserContext.Provider
      value={{ admissionNo, setAdmissionNo, userID, setUserID }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
