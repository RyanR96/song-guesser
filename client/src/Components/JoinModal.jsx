import { useState, useEffect } from "react";
import { AnimatePresence, motion, easeInOut } from "framer-motion";

function joinModal(props) {
  const {
    onClose,
    onJoinSuccess,
    externalError,
    isOpen,
    onLoginClick,
    onCreateAccountClick,
  } = props;
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const displayError = error || externalError;

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitted");

    const token = localStorage.getItem("token");

    if (token) {
      localStorage.removeItem("guestUsername");
      resetForm();
      onJoinSuccess();
      return;
    }

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter a username");
      return;
    }

    console.log("You are:", trimmedUsername);
    localStorage.setItem("guestUsername", trimmedUsername);
    resetForm();
    onJoinSuccess();
  }

  function handleClose() {
    resetForm();

    onClose();
  }

  function resetForm() {
    setUsername("");
    setError("");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center overflow-y-auto justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="relative w-full max-w-md max-h-[calc(100dvh-3rem)] overflow-y-auto bg-white p-6 rounded-2xl shadow-lg p-10"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
            transition={{ duration: 0.4 }}
          >
            <button
              type="button"
              className="absolute right-5 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              onClick={handleClose}
            >
              X
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-2xl">
                ♫
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Join the Game
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter a guest username to play
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-300"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username..."
              />
              <motion.p
                className="mt-2 min-h-5 text-sm font-semibold text-red-500"
                key={displayError}
                initial={{ opacity: 0 }}
                animate={
                  displayError
                    ? { opacity: 1, x: [0, -6, 6, -4, 4, 0] }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.35, ease: easeInOut }}
              >
                {displayError || ""}{" "}
              </motion.p>

              <button
                className="mt-3 w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-500"
                type="submit"
              >
                Join as guest
              </button>
            </form>
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="rounded-xl border border-purple-200 px-4 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
                onClick={onLoginClick}
              >
                Log in
              </button>
              <button
                className="rounded-xl border border-purple-200 px-4 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
                onClick={onCreateAccountClick}
              >
                Create Account
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default joinModal;
