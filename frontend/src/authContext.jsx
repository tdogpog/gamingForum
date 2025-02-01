import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

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
        console.error(err.message);
      }
    } else {
      // If no token, set user to null for guest access
      setUser(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token"); //clear token from local storage
    setUser(null); //clear user data from state
  };

  return (
    <AuthContext.Provider value={{ user, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

//easy export so we can just use useAuth(); when we need the context
//ignore the eslint flag
export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
