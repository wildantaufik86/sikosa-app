import { createContext, useState } from "react";
import {
  getAccessToken,
  getAuthUserSession,
  putAuthUserSession,
} from "../utils/utils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => getAuthUserSession());
  const [accessToken, setAccessToken] = useState(() => getAccessToken());

  const handleAuthUserChange = (newAuthUser) => {
    setAuthUser(newAuthUser);
    putAuthUserSession(newAuthUser);
  };

  const handleAccessToken = (accessToken) => {
    setAccessToken(accessToken);
    putAccessTokenSession(accessToken);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Error internal server");
      }

      setAuthUser(null);
      setAccessToken(null);
      sessionStorage.removeItem("authUser");
      sessionStorage.removeItem("accessToken");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        handleAuthUserChange,
        handleLogout,
        accessToken,
        handleAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
