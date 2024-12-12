import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleAuthUserChange = (newAuthUser) => {
    setAuthUser(newAuthUser);
    localStorage.setItem("authUser", JSON.stringify(newAuthUser));
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider
      value={{ authUser, handleAuthUserChange, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
