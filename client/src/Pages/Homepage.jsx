import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinModal from "../Components/JoinModal";
import CreateAccountModal from "../Components/CreateAccountModal";

function Homepage() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  function handlePlayClick() {
    const token = localStorage.getItem("token");
    if (token) {
      handleJoinSuccess();
    }

    setIsJoinOpen(true);
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
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
      >
        Create Account
      </button>
      <CreateAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAuthSuccess={handleJoinSuccess}
      />
    </div>
  );
}

export default Homepage;
