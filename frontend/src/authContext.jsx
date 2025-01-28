import React, { createContext, useContext, useState, useEffect } from "react";
import * as jwt_decode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); //token from local storage
    if (token) {
      try {
        const decoded = jwtDecode(token); //decode the token
        setUser({
          id: decoded.id,
          username: decoded.username,
          role: decoded.role,
        });
      } catch (err) {
        //invalid or expired tokens, debugging purposes
        console.error("Invalid token");
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("jwt"); //clear token from local storage
    setUser(null); //clear user data from state
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//easy export so we can just use useAuth(); when we need the context
export const useAuth = () => useContext(AuthContext);
