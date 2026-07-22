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
            <form onSubmit={handleSubmit}>
              <input
                className="border-2 border-black"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <button
                className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
                type="submit"
              >
                Join as guest
              </button>
            </form>
            {externalError && <p className="text-red-500">{externalError}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default joinModal;
