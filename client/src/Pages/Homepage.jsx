import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import JoinModal from "../Components/JoinModal";
import CreateAccountModal from "../Components/CreateAccountModal";
import LoginModal from "../Components/LoginModal";

function Homepage(props) {
  const { currentUser, onAuthSuccess, onLogout } = props;
  const API_URL = "http://localhost:3000";
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  function handlePlayClick() {
    if (localStorage.getItem("token")) {
      handleJoinSuccess();
      return;
    }

    setIsJoinOpen(true);
  }

  function handleHomepageAuthSuccess(newToken) {
    onAuthSuccess(newToken);

    setIsCreateAccountOpen(false);
    setIsLoginOpen(false);

    navigate("/game");
  }

  function handleJoinSuccess() {
    setIsJoinOpen(false);
    navigate("/game");
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
          onClick={onLogout}
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
        onAuthSuccess={handleHomepageAuthSuccess}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthSuccess={handleHomepageAuthSuccess}
      />
    </div>
  );
}

export default Homepage;
