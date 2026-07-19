import { Link, useLocation } from "react-router-dom";

function Navbar(props) {
  const { currentUser, onAuthSuccess, onLogout } = props;

  const location = useLocation();

  const isGamePage = location.pathname === "/game";
  return (
    <nav className="flex items-center justify-between p-4 border-b border-black">
      <div>
        <Link to="/" className="font-bold">
          Song Guessing Game
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/"> Home</Link>
          <Link to="/game"> Play</Link>

          {currentUser && (
            <Link
              to={`/profile/${currentUser.username}`}
              target={isGamePage ? "_blank" : undefined}
              rel={isGamePage ? "noopener noreferrer" : undefined}
            >
              My profile
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
