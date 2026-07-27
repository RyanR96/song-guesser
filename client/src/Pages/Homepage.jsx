import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [loginError, setLoginError] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    if (location.state?.openLogin) {
      setIsLoginOpen(true);
    }

    if (location.state?.loginError) {
      setLoginError(location.state.loginError);
      onLogout();
    }

    if (location.state?.openJoin) {
      setIsJoinOpen(true);
    }

    if (location.state?.joinError) {
      setJoinError(location.state.joinError);
    }

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, navigate]);

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
    <main className="min-h-[calc(100dvh-73px)] bg-gradient-to-b from-purple-50 via-white to-purple-50 px-4 py-14">
      <section className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-purple-100 bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur sm:px-10">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
            Song Guessing Game
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-600">
            Real-time music quiz. Guess the song title and artist as fast as
            possible.
          </p>
        </div>

        <div className="mb-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-center rounded-2xl bg-purple-50 px-4 py-3">
            <div className="flex w-full max-w-[230px] items-center justify-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                👥
              </span>

              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">
                  Real-time Multiplayer
                </p>{" "}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-purple-50 px-4 py-3">
            <div className="flex w-full max-w-[230px] items-center justify-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                🏆
              </span>

              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">
                  15 Round Games
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-purple-50 px-4 py-3">
            <div className="flex w-full max-w-[230px] items-center justify-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                📊
              </span>

              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">
                  Sign up to track stats
                </p>
              </div>
            </div>
          </div>
        </div>
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

        <JoinModal
          isOpen={isJoinOpen}
          onClose={() => {
            setIsJoinOpen(false);
            setJoinError("");
          }}
          onLoginClick={() => {
            setIsJoinOpen(false);
            setIsLoginOpen(true);
          }}
          onCreateAccountClick={() => {
            setIsJoinOpen(false);
            setIsCreateAccountOpen(true);
          }}
          onJoinSuccess={handleJoinSuccess}
          externalError={joinError}
        />

        <button
          onClick={() => setIsCreateAccountOpen(true)}
          className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
        >
          Create Account
        </button>
      </section>
      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onAuthSuccess={handleHomepageAuthSuccess}
        onLoginClick={() => {
          setIsLoginOpen(true);
          setIsCreateAccountOpen(false);
        }}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setLoginError("");
        }}
        onCreateAccountClick={() => {
          setIsLoginOpen(false);
          setIsCreateAccountOpen(true);
        }}
        onAuthSuccess={handleHomepageAuthSuccess}
        externalError={loginError}
      />
    </main>
  );
}

export default Homepage;
