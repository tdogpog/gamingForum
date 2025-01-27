import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="appContainer">
      <div className="appHeaderContainer">
        <header className="appHeader">
          <Link to={"/"}>
            <h2>OverClocked(SOME LOGO)</h2>
          </Link>
          <Link to={"/charts"}>
            <h2>Top Games</h2>
          </Link>
          <Link to={"/games/genres"}>
            <h2>Genres</h2>
          </Link>
          <div className="headerButtons">
            <button className="backButton">
              <Link to={"/"}>Back to Home</Link>
            </button>
            <button className="backButton">
              <Link to={"/auth"}>Login or Create an Account</Link>
            </button>
          </div>
        </header>
      </div>
      <main className="appMain">{children}</main>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
