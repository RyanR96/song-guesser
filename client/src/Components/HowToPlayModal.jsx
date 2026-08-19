import { motion, AnimatePresence } from "framer-motion";

function HowToPlayModal(props) {
  const { isOpen, onClose } = props;

  const steps = [
    {
      icon: "👤",
      title: "1. Join a lobby",
      text: "Play as a guest or log in to save your stats.",
    },
    {
      icon: "🎧",
      title: "2. Listen to the preview",
      text: "Each round plays a short song clip after a short prep countdown.",
    },
    {
      icon: "✏️",
      title: "3. Guess title and artist",
      text: "Enter guesses one at a time. Title and artist are guessed separately.",
    },
    {
      icon: "⭐",
      title: "4. Score points",
      text: "+1 for title, +1 for artist, +2 bonus for getting both, with extra bonuses for first and second place.",
    },
    {
      icon: "📊",
      title: "5. Track your progress",
      text: "The leaderboard updates live, and completed songs appear in the revealed songs panel.",
    },
    {
      icon: "🎵",
      title: "6. Profile stats",
      text: "Logged-in players save total points, wins, best guess time, and average guess time.",
    },
  ];

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
            className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto bg-white rounded-3xl shadow-lg px-6 py-7 sm:px-8"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={onClose}
              className="absolute right-5 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              X
            </button>

            <div className="mb-5 text-center">
              <h2 className="text-3xl font-extrabold text-purple-700">
                How to Play
              </h2>
            </div>

            <div className="space-y-3">
              {steps.map(step => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-xl">
                    {step.icon}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-800">
                      {step.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-500"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HowToPlayModal;
