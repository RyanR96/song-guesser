import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";

function Gamepage() {
  const [error, setError] = useState("");
  const [gameState, setGameState] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [guessFeedback, setGuessFeedback] = useState(null);
  const [displayTimer, setDisplayTimer] = useState(0);
  const [guess, setGuess] = useState("");
  const [lobbyState, setLobbyState] = useState(null);
  const [nextGameTimer, setNextGameTimer] = useState(0);
  const [nextSongTimer, setNextSongTimer] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const [volume, setVolume] = useState(0.2);

  const mockLeaderboard = Array.from({ length: 30 }, (_, index) => ({
    username: `Player${index + 1}`,
    score: 100 - index,
    bothCorrectTime: null,
  }));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const guestUsername = localStorage.getItem("guestUsername");

    if (!token && !guestUsername) {
      navigate("/", {
        state: {
          joinError: "Enter a guest username/login to play",
          openJoin: true,
        },
      });
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

      const isInvalidToken = err.message === "Invalid token";

      const message = isInvalidToken
        ? "Your session expired. Please login again"
        : "Could not connect to game. Try again later";

      if (isInvalidToken) {
        localStorage.removeItem("token");
      }

      socket.disconnect();

      navigate("/", {
        state: isInvalidToken
          ? {
              loginError: message,
              openLogin: true,
            }
          : {
              joinError: message,
              openJoin: true,
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
      socket.off("connect_error", handleConnectError);
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
    console.log(gameState.revealedSongs);

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
  }, [gameState?.round, gameState?.timeLeft, gameState?.roundPhase]);

  // Preloading audio

  useEffect(() => {
    if (!gameState?.previewUrl) return;

    const audio = new Audio(gameState.previewUrl);
    audio.preload = "auto";
    audio.volume = volume;
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

  //Responsible for changing audio volume, audio would be created if I do this elsewhere
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = volume;
  }, [volume]);

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

  //sets GuessFeedback to empty after each round
  useEffect(() => {
    setGuessFeedback(null);
  }, [gameState?.round]);

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
    <main className="min-h-[calc(100dvh-73px)] bg-gradient-to-b from-purple-50 via-white to-purple-50 px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-12 items-stretch">
        <aside className="lg:col-span-3">
          <LeaderboardCard leaderboard={gameState.leaderboard} />
        </aside>

        <section className="lg:col-span-6">
          {gameOverData && !gameState.isPlaying ? (
            <GameOverPanel
              gameOverData={gameOverData}
              nextGameTimer={nextGameTimer}
              mockLeaderboard={mockLeaderboard}
            />
          ) : (
            <MainGamePanel
              gameState={gameState}
              volume={volume}
              setVolume={setVolume}
              nextGameTimer={nextGameTimer}
              displayTimer={displayTimer}
              nextSongTimer={nextSongTimer}
              handleGuessSubmit={handleGuessSubmit}
              guess={guess}
              setGuess={setGuess}
              guessFeedback={guessFeedback}
            />
          )}
        </section>
        <aside className="lg:col-span-3">
          <RevealedSongCard songs={gameState.revealedSongs} />
        </aside>
      </div>
    </main>
  );
}

function LeaderboardCard(props) {
  const leaderboard = props.leaderboard ?? [];

  return (
    <div className="rounded-3xl border border-purple-100 bg-white/90 p-5 shadow-sm backdrop-blur h-full lg:min-h-[540px]">
      <h2 className="mb-5 text-lg font-extrabold text-purple-700">
        🏆 Leaderboard
      </h2>
      <ul className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {leaderboard.map((player, index) => (
          <li
            key={player.username}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">
                  {player.username}
                </p>

                {typeof player.bothCorrectTime === "number" && (
                  <p className="text-xs text-slate-500">
                    Guessed correctly in:{" "}
                    {(player.bothCorrectTime / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
            </div>
            <p className="font-extrabold text-purple-700">{player.score}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MainGamePanel(props) {
  const {
    gameState,
    volume,
    setVolume,
    nextGameTimer,
    displayTimer,
    nextSongTimer,
    handleGuessSubmit,
    guess,
    setGuess,
    guessFeedback,
  } = props;

  const isPreparing = gameState.roundPhase === "preparing";
  const isPlaying = gameState.roundPhase === "playing";
  const isLobby = !gameState.isPlaying;

  let heading = "Waiting in lobby";
  let subtitle = "The next game will start soon";
  let timerText = "";

  let timerValue = 0;
  let timerTotal = 0;

  if (nextGameTimer > 0) {
    timerText = `Game starts in ${Math.ceil(nextGameTimer / 1000)}s`;
  }

  if (isPreparing) {
    heading = "Get ready!";
    subtitle = "The next song is about to play";
    timerText = `Song will play in ${Math.ceil(nextSongTimer / 1000)}s`;
  }

  if (isPlaying) {
    heading = "What's this song?";
    subtitle = "The song is now playing";
    timerText = `${Math.ceil(displayTimer / 1000)}s left`;
  }

  const roundLabel =
    gameState.round > 0
      ? gameState.totalRounds
        ? `Round ${gameState.round} of ${gameState.totalRounds}`
        : `Round ${gameState.round}`
      : "Waiting for game";
  return (
    <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8 h-full lg:min-h-[600px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold text-slate-800">{roundLabel}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-32 accent-purple-500"
          />
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-purple-700">
          {heading}
        </h1>

        <p className="mt-4 text-slate-500">{subtitle}</p>

        <div className="my-8 flex flex-col h-36 w-36 items-center justify-center">
          <span className="text-4xl text-purple-600">🎶</span>
          <span className="mt-2 text-3xl font-extrabold text-purple-700">
            {timerText}
          </span>
        </div>
        <form
          onSubmit={handleGuessSubmit}
          className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]"
        >
          <input
            placeholder="Enter artist name or song title"
            onChange={e => setGuess(e.target.value)}
            value={guess}
            disabled={isLobby}
            className="rounded-xl border border-slate-300 px-4 py-4 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <button
            type="submit"
            className="rounded-xl bg-purple-600 px-8 py-4 font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-300"
          >
            Guess
          </button>
        </form>
        <p className="mt-3 text-sm text-slate-500">
          Type the artist name or song title
        </p>

        {guessFeedback?.message && (
          <div className="mt-6 w-full max-w-2xl rounded-2xl border border-purple-100 px-5 py-4 text-center">
            <p className="font-semibold text-purple-700">
              {guessFeedback.message}
            </p>

            {guessFeedback.pointsAwarded > 0 && (
              <p className="mt-1 text-sm font-semibold text-green-600">
                +{guessFeedback.pointsAwarded} points
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GameOverPanel(props) {
  const { nextGameTimer, gameOverData, mockLeaderboard } = props;
  const leaderboard = gameOverData?.leaderboard ?? [];
  return (
    <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm backdrop-blur text-center sm:p-8 h-full lg:min-h-[540px]">
      <h1 className="text-3xl font-extrabold text-purple-700 ">Game over!</h1>
      {nextGameTimer > 0 && (
        <p className="mt-6 font-semibold text-slate-500">
          Next game starts in:{" "}
          <span className="text-purple-700">
            {Math.ceil(nextGameTimer / 1000)}s
          </span>
        </p>
      )}
      <p className="mt-2 text-sm text-slate-500">Final leaderboard</p>
      {leaderboard.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No players found</p>
      ) : (
        <ol className="mx-auto mt-6 max-w-md space-y-3 text-left max-h-[400px] overflow-y-auto pr-1">
          {leaderboard.map((player, index) => (
            <li
              key={player.username}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3"
            >
              <span className="font-semibold text-slate-800">
                {index + 1}. {player.username}{" "}
              </span>
              <span className="font-semibold text-purple-700">
                {player.score}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function RevealedSongCard(props) {
  const { songs } = props;
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [songs.length]);
  return (
    <div className="rounded-3xl border border-purple-100 bg-white/90 p-5 shadow-sm backdrop-blur h-full lg:min-h-[540px]">
      <h2 className="mb-5 text-lg font-extrabold text-purple-700">
        🎵 Revealed Songs
      </h2>
      {songs.length === 0 ? (
        <p className="text-sm text-slate-500">
          Songs will appear here after each round
        </p>
      ) : (
        <ul
          className="space-y-3 max-h-[480px] overflow-y-auto pr-1"
          ref={listRef}
        >
          {songs.map(song => (
            <li
              key={song.round}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              {song.artworkUrl ? (
                <img
                  src={song.artworkUrl}
                  alt={`${song.title} artwork`}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover border border-black"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                  🎵
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-bold text-purple-600">
                  Round {song.round}
                </p>

                {song.trackViewUrl ? (
                  <a
                    href={song.trackViewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-bold text-slate-800 underline-offset-2 hover:underline"
                  >
                    {song.title}
                  </a>
                ) : (
                  <p className="truncate text-sm text-slate-500">
                    {song.title}
                  </p>
                )}

                <p className="truncate text-sm text-slate-500">
                  {song.artist.join(", ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Gamepage;
