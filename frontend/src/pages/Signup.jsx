import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup({ backend }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordconfirm: "",
  });
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState(false); // Error state

  //OUTDATED REDIRECT LOGIC FOR NOW FROM PAST LOGIC.. IDEALLY REDIR TO LAST PAGE THEY WERE ON???
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

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

      //log the user in if account creation is successful
      const loginResponse = await axios.post(`${backend}auth`, {
        username,
        password,
      });

      localStorage.setItem("token", loginResponse.data.token);
      navigate("/"); //redir to homepage
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
              <label htmlFor="userName">Username</label>
              <input
                type="text"
                id="userName"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email">email</label>
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
            <button
              type="submit"
              disabled={formData.password !== formData.passwordconfirm}
            >
              Signup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

Signup.propTypes = {
  backend: PropTypes.string.isRequired,
};
