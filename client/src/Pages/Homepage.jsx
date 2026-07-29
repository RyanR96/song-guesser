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
      <section className="mx-auto flex max-w-4xl flex-col items-center rounded-3xl border border-purple-100 bg-white/80 px-6 py-16 text-center shadow-sm backdrop-blur sm:px-10 gap-6">
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
        <button
          className="w-full max-w-md rounded-xl bg-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-500"
          onClick={handlePlayClick}
        >
          ▶️ Play game
        </button>
        {/**
         *         {currentUser && (
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
         * 
         * 
         */}
        <div className="mt-5 flex w-full max-w-md flex-col items-center gap-5">
          {!currentUser ? (
            <>
              <p className="text-sm font-medium text-slate-500">
                Play as a guest or login to save your stats
              </p>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="rounded-xl border border-purple-200 px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateAccountOpen(true)}
                  className="rounded-xl border border-purple-200 px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
                >
                  Create Account
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-500">
                Logged in as{" "}
                <span className="font-bold text-purple-700">
                  {currentUser.username}
                </span>
              </p>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to={`profile/${currentUser.username}`}
                  className="rounded-xl border border-purple-200 px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
                >
                  My Profile
                </Link>
                <button
                  onClick={onLogout}
                  className="rounded-xl border border-purple-200 px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </section>
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
