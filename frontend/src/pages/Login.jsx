import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login({ backend }) {
  const [userName, setuserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  //OUTDATED REDIRECT LOGIC FOR NOW FROM PAST LOGIC.. IDEALLY REDIR TO LAST PAGE THEY WERE ON???
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${backend}auth`, {
        username: userName,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (error) {
      console.log("Error with login:", error.message);
      alert("Error with the try on login");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-content">
          <h2>Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label htmlFor="userName">Username</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setuserName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
        <Link to={`/signup`}>Create an account</Link>
      </div>
    </div>
  );
}

Login.propTypes = {
  backend: PropTypes.string.isRequired,
};

// send in a form json payload that has user/pass to the api
// the api will verify at the endpoint
// it should return a json payload contaaining the jwt
// put this jwt into local storage for The context
