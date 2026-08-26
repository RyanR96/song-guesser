import { useState } from "react";

import { motion, AnimatePresence, easeInOut } from "framer-motion";

function LoginModal(props) {
  const API_URL = import.meta.env.VITE_API_URL;
  const {
    isOpen,
    onClose,
    onAuthSuccess,
    externalError,
    onCreateAccountClick,
  } = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};

    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";

    requestAnimationFrame(() => {
      setErrors(newErrors);
    });

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(res);
        setErrors({ api: "Invalid login/password" });
        return;
      }

      onAuthSuccess?.(data.token);

      onClose();
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error("Failed", err);
      setErrors({ api: "Error, please try again later" });
    }
  };

  //if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="relative w-full max-w-md max-h-[calc(100dvh-3rem)] overflow-y-auto bg-white p-6 rounded-3xl shadow-lg px-8 py-8"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => {
                onClose();
                setPassword("");
                setUsername("");
                setErrors({});
              }}
              className="absolute right-5 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              X
            </button>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-2xl">
                🔒
              </div>

              <h2 className="text-2xl font-bold text-slate-900">Log in:</h2>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="">
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-300"
                ></input>

                <motion.p
                  className="text-red-500 text-sm mt-1 h-2 font-semibold"
                  key={errors.username}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: easeInOut }}
                >
                  {" "}
                  {errors.username || " "}
                </motion.p>
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-300"
                ></input>
                <motion.p
                  className="text-red-500 text-sm mt-1 h-2 font-semibold"
                  key={errors.password}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: easeInOut }}
                >
                  {" "}
                  {errors.password || " "}
                </motion.p>
                <motion.p
                  className="text-red-500 text-sm mt-1 h-2 font-semibold"
                  key={errors.api}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: easeInOut }}
                >
                  {errors.api || ""}
                  <span>{externalError || ""}</span>
                </motion.p>
              </div>

              <button
                className="mt-3 w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-500"
                type="submit"
              >
                Login
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500 ">
              Don't have an account?{" "}
              <button
                className="font-semibold text-purple-700 hover:text-purple-500 ml-1"
                onClick={onCreateAccountClick}
              >
                Create one
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginModal;
