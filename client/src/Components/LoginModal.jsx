import { useState } from "react";

import { motion, AnimatePresence, easeInOut } from "framer-motion";

function LoginModal(props) {
  const API_URL = "http://localhost:3000";
  const { isOpen, onClose, onAuthSuccess, externalError } = props;
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
              onClick={() => {
                onClose();
                setPassword("");
                setUsername("");
                setErrors({});
              }}
              className="absolute top-0 right-0 mt-2 mr-2 text-lg text-gray-500 hover:text-gray-800 "
            >
              X
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center"> Login:</h2>
            <form
              className="flex flex-col justify-evenly h-full"
              onSubmit={handleSubmit}
            >
              <div className="">
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-green-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-green-500"
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
                className="bg-green-500 text-black px-6 py-1 rounded-full font-semibold hover:bg-green-300 w-full"
                type="submit"
              >
                Login
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginModal;
