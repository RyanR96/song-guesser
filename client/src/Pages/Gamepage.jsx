import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";

function Gamepage() {
  const [error, setError] = useState("");
  const [gameState, setGameState] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [guessFeedback, setGuessFeedback] = useState("");
  const [displayTimer, setDisplayTimer] = useState(0);
  const [guess, setGuess] = useState("");
  const [lobbyState, setLobbyState] = useState(null);
  const [nextGameTimer, setNextGameTimer] = useState(0);
  const [nextSongTimer, setNextSongTimer] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();

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

    function handleConnect() {
      // need to add token join
      if (guestUsername) {
        socket.emit("join", { username: guestUsername });
      } else {
        socket.emit("join", {});
      }
    }

    // err for logged users
    function handleConnectError(err) {
      console.log(err.message);
      const message =
        err.message === "Invalid token"
          ? "Your session expired. Please login again"
          : "Could not connect to game";

      localStorage.removeItem("token");
      socket.disconnect();

      navigate("/", {
        state: {
          loginError: message,
          openLogin: err.message === "Invalid token",
        },
      });
    }

    //err for guests
    function handleJoinResult(data) {
      console.log(data.error);
      if (!data.success) {
        const message = data.error || "Could not join game";

        if (
          data.error === "Username already exists" ||
          data.error === "Username already in the game"
        ) {
          localStorage.removeItem("guestUsername");
        }
        socket.disconnect();
        navigate("/", {
          state: {
            joinError: message,
            openJoin: true,
          },
        });

        return;
      }
      setError("");
    }

    function getState(data) {
      setGameState(data);

      //sets gameOverData to null each time a new game is started. Not the best place to put it! But will do for now
      if (data.isPlaying) {
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
      if (data.progress.bothCorrectTime) {
        console.log("Got it correct in :");
        console.log((data.progress?.bothCorrectTime / 1000).toFixed(1));
      }
    }

    function handleLobbyState(data) {
      console.log("Lobby state", data);
      setLobbyState(data);
    }

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("joinResult", handleJoinResult);
    socket.on("state", getState);
    socket.on("guessResult", handleGuessFeedback);
    socket.on("gameOver", handleGameOver);
    socket.on("lobbyState", handleLobbyState);

    if (!socket.connected) {
      socket.connect();
    }

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

  // Prep timer/ NextSongTimer

  useEffect(() => {
    if (gameState?.prepTime == null) return;
    if (gameState?.roundPhase !== "preparing") {
      setNextSongTimer(0);
      return;
    }

    setNextSongTimer(gameState.prepTime);

    const interval = setInterval(() => {
      setNextSongTimer(prev => Math.max(0, prev - 100));
      console.log(nextSongTimer);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [gameState?.round, gameState?.roundPhase, gameState?.prepTime]);

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
    if (gameState?.roundPhase !== "playing") {
      setDisplayTimer(0);
      return;
    }

    setDisplayTimer(gameState.timeLeft);

    const interval = setInterval(() => {
      setDisplayTimer(prev => Math.max(0, prev - 100));
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [gameState?.round, gameState?.timeLeft]);

  // Preloading audio

  useEffect(() => {
    if (!gameState?.previewUrl) return;

    const audio = new Audio(gameState.previewUrl);
    audio.preload = "auto";
    audio.load();

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";

      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [gameState?.round, gameState?.previewUrl]);

  // responsible for playing audio
  useEffect(() => {
    if (gameState?.roundPhase !== "playing") return;
    if (!audioRef.current) return;

    const audio = audioRef.current;

    audio.currentTime = 0;

    audio.play().catch(error => {
      console.log("Audio failed to play", error);
    });

    console.log(gameState.previewUrl);

    return () => {
      audio.pause();
    };
  }, [gameState?.round, gameState?.roundPhase]);

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

      {gameState.roundPhase === "playing" && (
        <p>Seconds left: {Math.ceil(displayTimer / 1000)}</p>
      )}

      {gameState.roundPhase === "preparing" && (
        <p>
          Get ready! Song will start playing in:{" "}
          {Math.ceil(nextSongTimer / 1000)}{" "}
        </p>
      )}

      {nextGameTimer > 0 && (
        <p>Time until next game start: {Math.ceil(nextGameTimer / 1000)}</p>
      )}

      <p>Round: {gameState.round}</p>

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
            {typeof player.bothCorrectTime === "number" && (
              <span>
                {" "}
                You got the answer correct in :{" "}
                {(player.bothCorrectTime / 1000).toFixed(1)}s
              </span>
            )}
          </li>
        ))}
      </ul>

      {gameOverData && !gameState.isPlaying && (
        <ul>
          <p>Game Over!</p>
          {gameOverData.leaderboard.map((player, index) => (
            <li key={player.username}>
              {index + 1}. {player.username} : {player.score}{" "}
            </li>
          ))}
        </ul>
      )}
      <ul>
        {gameState?.revealedSongs?.map(song => (
          <li key={song.round}>
            {song.artworkUrl && <img src={song.artworkUrl} />}
            {song.trackViewUrl ? (
              <a
                href={song.trackViewUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-2 hover:opacity-75"
              >
                {song.title}
              </a>
            ) : (
              <span>{song.title}</span>
            )}
            <span> {song.artist.join(", ")} </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Gamepage;
