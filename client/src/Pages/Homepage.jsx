import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import JoinModal from "../Components/JoinModal";
import CreateAccountModal from "../Components/CreateAccountModal";
import LoginModal from "../Components/LoginModal";

function Homepage() {
  const API_URL = "http://localhost:3000";
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          localStorage.removeItem("token");
          setToken(null);
          setCurrentUser(null);
          return;
        }

        setCurrentUser(data);
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    }

    fetchCurrentUser();
  }, [API_URL, token]);

  function handlePlayClick() {
    if (token) {
      handleJoinSuccess();
      return;
    }

    setIsJoinOpen(true);
  }

  function handleAuthSuccess(newToken) {
    localStorage.setItem("token", newToken);
    localStorage.removeItem("guestUsername");
    setToken(newToken);
    setIsCreateAccountOpen(false);

    navigate("/game");
  }

  function handleJoinSuccess() {
    setIsJoinOpen(false);
    navigate("/game");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
  }

  return (
    <div className="items-center justify-center flex flex-col">
      <h1 className="text-3xl font-bold underline text-center">
        Song Guessing Game
      </h1>

      {currentUser && (
        <Link
          to={`profile/${currentUser.username}`}
          className="underline underline-offset-2 font-semibold"
        >
          My Profile
        </Link>
      )}

      {currentUser && (
        <button
          onClick={handleLogout}
          className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
        >
          Logout
        </button>
      )}

      {!currentUser && (
        <button
          onClick={() => setIsLoginOpen(true)}
          className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
        >
          Login
        </button>
      )}

      <p className="text-center">Join the lobby</p>
      <button
        className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
        onClick={handlePlayClick}
      >
        Play game
      </button>
      {isJoinOpen && (
        <JoinModal
          onClose={() => setIsJoinOpen(false)}
          onJoinSuccess={handleJoinSuccess}
        />
      )}
      <button
        onClick={() => setIsCreateAccountOpen(true)}
        className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
      >
        Create Account
      </button>
      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default Homepage;
