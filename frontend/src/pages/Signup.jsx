import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../authContext"; //custom hook

export default function Signup({ backend }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordconfirm: "",
  });
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState(false); // Error state
  const { setUser } = useAuth(); // need to refresh component

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { password, passwordconfirm, username, email } = formData;

    if (password !== passwordconfirm) {
      setPasswordError(true);
      return;
    }

    try {
      //create the account
      const response = await axios.post(`${backend}user`, {
        username,
        password,
        passwordconfirm,
        email,
      });

      //duplication of the exact same code we use for logging in
      //its a clean experience to log the user in immediately when they create an account
      if (response) {
        const loginResponse = await axios.post(`${backend}auth`, {
          username,
          password,
        });
        const token = loginResponse.data.token;
        localStorage.setItem("token", token);

        //update the context
        //this will trigger component regen on all things that rely on context
        //so conditional rendering works properly when you login
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          username: decoded.username,
          role: decoded.role,
        });

        navigate("/"); // Redirect after login
      }
    } catch (error) {
      console.log("Error during account creation or login:", error.message);
      alert(
        error.response?.data?.message || "Error with account creation or login"
      );
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-content">
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="passwordconfirm">Confirm Password</label>
              <input
                type="password"
                id="passwordconfirm"
                value={formData.passwordconfirm}
                onChange={handleChange}
                required
              />
            </div>
            {passwordError && (
              <div style={{ color: "red", fontSize: "12px" }}>
                Passwords must match
              </div>
            )}
            <button type="submit">Signup</button>
          </form>
        </div>
      </div>
    </div>
  );
}

Signup.propTypes = {
  backend: PropTypes.string.isRequired,
};

//notes:
//maybe some better feedback when the user logs in?
//im thinking conditional rendering on the homepage
//where it typically says welcome to overclocked
//we can have welcome to overlocked, user
//to show that they are indeed now logged in
//QOL for later
