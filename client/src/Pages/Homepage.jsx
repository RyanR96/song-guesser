import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinModal from "../Components/JoinModal";

function Homepage() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const navigate = useNavigate();

  function handlePlayClick() {
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
    </div>
  );
}

export default Homepage;
