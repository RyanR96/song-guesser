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

  const subtleButtonClass =
    "rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-purple-50 hover:text-purple-700";

  const primaryButtonClass =
    "rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-purple-200 transition hover:bg-purple-600";

  const secondaryButtonClass =
    "rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50";

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
    <>
      <nav className="sticky top-0 z-40 border-b border-purple-100 bg-white/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="text-lg font-extrabold tracking-tight text-slate-900"
          >
            Song Guessing Game
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link to="/" className={subtleButtonClass}>
              Home
            </Link>

            <button
              type="button"
              onClick={() => {}}
              className={subtleButtonClass}
            >
              How to play
            </button>

            <Link to="/game" className={primaryButtonClass}>
              Play
            </Link>

            {currentUser && (
              <Link
                to={`/profile/${currentUser.username}`}
                target={isGamePage ? "_blank" : undefined}
                rel={isGamePage ? "noopener noreferrer" : undefined}
                className={subtleButtonClass}
              >
                My profile
              </Link>
            )}

            {currentUser && (
              <button
                onClick={handleNavbarLogout}
                className={secondaryButtonClass}
              >
                Logout
              </button>
            )}

            {!currentUser && (
              <>
                <button
                  className={secondaryButtonClass}
                  onClick={() => setIsLoginOpen(true)}
                >
                  Login
                </button>
                <button
                  className={secondaryButtonClass}
                  onClick={() => setIsCreateAccountOpen(true)}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>{" "}
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
    </>
  );
}

export default Navbar;
