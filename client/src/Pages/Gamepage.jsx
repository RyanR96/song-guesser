import { useEffect, useState } from "react";
import { socket } from "../socket";

function Gamepage() {
  const [error, setError] = useState("");
  const [gameState, setGameState] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [guessFeedback, setGuessFeedback] = useState("");
  const [displayTimer, setDisplayTimer] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const guestUsername = localStorage.getItem("guestUsername");

    if (!token && !guestUsername) {
      setError("No username/account found. Please login/enter a username");
      console.log("No user/login");
      return;
    }

    if (token) {
      socket.auth = { token };
    } else {
      socket.auth = {};
    }

    if (!socket.connected) {
      socket.connect();
    }

    function handleConnect() {
      // need to add token join
      if (guestUsername) {
        socket.emit("join", { username: guestUsername });
      } else {
        socket.emit("join", {});
      }
    }

    function handleJoinResult(data) {
      if (!data.success) {
        setError(data.error);
        if (data.error === "Username already exists") {
          localStorage.removeItem("guestUsername");
          alert("Placeholder, send user back");
        }
      }
    }

    function getState(data) {
      setGameState(data);
      console.log(data);
    }

    function handleGameOver(data) {
      setGameOverData(data);
      console.log("GameOver data:", data);
    }

    function handleGuessFeedback(data) {
      setGuessFeedback(data);
      console.log(data);
    }

    socket.on("connect", handleConnect);
    socket.on("joinResult", handleJoinResult);
    socket.on("state", getState);
    socket.on("guessResult", handleGuessFeedback);
    socket.on("gameOver", handleGameOver);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("joinResult", handleJoinResult);
      socket.off("state", getState);
      socket.off("guessResult", handleGuessFeedback);
      socket.off("gameOver", handleGameOver);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (gameState?.timeLeft == null) return;

    setDisplayTimer(gameState.timeLeft);

    const interval = setInterval(() => {
      setDisplayTimer(prev => {
        setDisplayTimer(Math.max(0, prev - 100));
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [gameState?.round, gameState?.timeLeft]);

  function handleGuessSubmit(guess) {
    socket.emit("guess", { guess });
  }

  if (error) return <div>{error}</div>;

  if (!gameState) return <div>Loading game</div>;
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold underline">Gamepage!</h1>

      <p>Seconds left: {Math.ceil(displayTimer / 1000)}</p>
      <p>{gameState.round}</p>

      <button
        className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
        onClick={() => handleGuessSubmit("Sleepwalking")}
      >
        Guess
      </button>

      {guessFeedback && <p>{guessFeedback.message}</p>}

      {gameOverData && (
        <div>
          <p>Game Over!</p>
          {gameOverData.leaderboard.map((player, index) => (
            <div key={player.username}>
              {index + 1}. {player.username} : {player.score}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Gamepage;
