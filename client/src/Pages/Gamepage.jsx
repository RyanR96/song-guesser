import { useEffect, useState } from "react";
import { socket } from "../socket";

function Gamepage() {
  const [error, setError] = useState("");
  const [gameState, setGameState] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [guessFeedback, setGuessFeedback] = useState("");
  const [displayTimer, setDisplayTimer] = useState(0);
  const [guess, setGuess] = useState("");
  const [lobbyState, setLobbyState] = useState(null);
  const [nextGameTimer, setNextGameTimer] = useState(0);

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

      //sets gameOverData to null each time a new game is started. Not the best place to put it! But will do for now
      if (data.isPlaying && gameOverData !== null) {
        setGameOverData(null);
      }
      console.log("Game state Data:", data);
    }

    function handleGameOver(data) {
      setGameOverData(data);
      console.log("GameOver data:", data);
    }

    function handleGuessFeedback(data) {
      setGuessFeedback(data);
      console.log(data);
    }

    function handleLobbyState(data) {
      console.log("Lobby state", data);
      setLobbyState(data);
    }

    socket.on("connect", handleConnect);
    socket.on("joinResult", handleJoinResult);
    socket.on("state", getState);
    socket.on("guessResult", handleGuessFeedback);
    socket.on("gameOver", handleGameOver);
    socket.on("lobbyState", handleLobbyState);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("joinResult", handleJoinResult);
      socket.off("state", getState);
      socket.off("guessResult", handleGuessFeedback);
      socket.off("gameOver", handleGameOver);
      socket.off("lobbyState", handleLobbyState);
      socket.disconnect();
    };
  }, []);

  // Next game starting timer
  useEffect(() => {
    if (!lobbyState?.isCountingDown) {
      setNextGameTimer(0);
      return;
    }
    if (lobbyState?.timeLeft == null) return;

    setNextGameTimer(lobbyState.timeLeft);

    const interval = setInterval(() => {
      setNextGameTimer(prev => Math.max(0, prev - 100));
      console.log(nextGameTimer);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [lobbyState?.isCountingDown, lobbyState?.timeLeft]);

  // Round timer
  useEffect(() => {
    if (gameState?.timeLeft == null) return;

    setDisplayTimer(gameState.timeLeft);

    const interval = setInterval(() => {
      setDisplayTimer(prev => Math.max(0, prev - 100));
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [gameState?.round, gameState?.timeLeft]);

  function handleGuessSubmit(e) {
    e.preventDefault();

    if (!guess.trim()) return;

    console.log(e.target.value);

    socket.emit("guess", { guess });
    setGuess("");
  }

  if (error) return <div>{error}</div>;

  if (!gameState) return <div>Loading game</div>;
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold underline">Gamepage!</h1>

      <p>Seconds left: {Math.ceil(displayTimer / 1000)}</p>

      {nextGameTimer > 0 && (
        <p>Time until next game start: {Math.ceil(nextGameTimer / 1000)}</p>
      )}

      <p>{gameState.round}</p>

      <form onSubmit={handleGuessSubmit}>
        <input
          placeholder="Enter guess here"
          className="border-2 border-black"
          onChange={e => setGuess(e.target.value)}
          value={guess}
        ></input>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
        >
          Guess
        </button>
      </form>

      {guessFeedback && <p>{guessFeedback.message}</p>}

      <ul className="space-y-2 text-left mx-20">
        {gameState?.leaderboard?.map((player, index) => (
          <li key={player.username}>
            {index + 1}. {player.username} : {player.score}
          </li>
        ))}
      </ul>

      {gameOverData && !gameState.isPlaying && (
        <ul>
          <p>Game Over!</p>
          {gameOverData.leaderboard.map((player, index) => (
            <li key={player.username}>
              {index + 1}. {player.username} : {player.score}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Gamepage;
