import { useState, useEffect } from "react";
import { AnimatePresence, motion, easeInOut } from "framer-motion";

function joinModal(props) {
  const { onClose, onJoinSuccess, externalError, isOpen } = props;
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitted");

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter a username");
      return;
    }

    console.log("You are:", trimmedUsername);
    localStorage.setItem("guestUsername", trimmedUsername);
    onJoinSuccess();
  }

  function handleClose() {
    setUsername("");
    setError("");
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="relative bg-white p-6 rounded-2xl shadow-lg h-[50%] p-10"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
            transition={{ duration: 0.4 }}
          >
            <button
              type="button"
              className="absolute right-5 top-4 text-xl text-slate-400 hover:text-slate-700"
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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-400"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username..."
              />
              <motion.p
                className="mt-2 min-h-5 text-sm font-semibold text-red-500"
                key={externalError}
                initial={{ opacity: 0 }}
                animate={
                  externalError
                    ? { opacity: 1, x: [0, -6, 6, -4, 4, 0] }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.35, ease: easeInOut }}
              >
                {externalError || ""}{" "}
                {/** Add regular errors to this later, will probably need combining into a new state */}
              </motion.p>

              <button
                className="mt-3 w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-500"
                type="submit"
              >
                Join as guest
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default joinModal;
