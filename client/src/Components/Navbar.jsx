import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import CreateAccountModal from "./CreateAccountModal";
import LoginModal from "./LoginModal";

function Navbar(props) {
  const { currentUser, onAuthSuccess, onLogout } = props;
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isGamePage = location.pathname === "/game";

  function handleNavbarAuthSuccess(newToken) {
    onAuthSuccess(newToken);

    setIsCreateAccountOpen(false);
    setIsLoginOpen(false);

    if (isGamePage) {
      window.location.reload();
    }
  }

  function handleNavbarLogout() {
    onLogout();
    navigate("/");
  }
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

          {currentUser && <button onClick={handleNavbarLogout}>Logout</button>}

          {!currentUser && (
            <>
              <button onClick={() => setIsLoginOpen(true)}>Login</button>
              <button onClick={() => setIsCreateAccountOpen(true)}>
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onAuthSuccess={handleNavbarAuthSuccess}
        onLoginClick={() => {
          setIsLoginOpen(true);
          setIsCreateAccountOpen(false);
        }}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthSuccess={handleNavbarAuthSuccess}
        onCreateAccountClick={() => {
          setIsLoginOpen(false);
          setIsCreateAccountOpen(true);
        }}
      />
    </nav>
  );
}

export default Navbar;
