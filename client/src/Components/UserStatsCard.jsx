function UserStatsCard(props) {
  const { stats } = props;

  const averageGuesstime =
    stats.totalGuesses > 0 ? stats.totalGuessTime / stats.totalGuesses : null;

  if (!stats) return <p> No stats available</p>;

  function formatGuessTime(value) {
    if (typeof value !== "number") return "No correct guesses...yet";

    return `${(value / 1000).toFixed(1)}s`;
  }

  const cards = [
    {
      icon: "🏆",
      label: "Total points",
      value: stats.totalPoints ?? 0,
      description: "Points earned across all games",
    },
    {
      icon: "👑",
      label: "Games Won",
      value: stats.gamesWon ?? 0,
      description: "Total games won",
    },
    {
      icon: "🎯",
      label: "Total correct rounds",
      value: stats.totalGuesses ?? 0,
      description: "Rounds answered correctly",
    },
    {
      icon: "⏱️",
      label: "Best guess time",
      value: formatGuessTime(stats.bestGuessTime),
      description: "Your fastest correct guess",
    },
    {
      icon: "⏰",
      label: "Average guess time",
      value: formatGuessTime(averageGuesstime),
      description: "Average time per correct guess",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className={`rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm backdrop-blur ${index < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}
        >
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple-100 text-3xl">
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600"> {card.label}</p>
              <p className="mt-2 text-4xl font-extrabold text-purple-700">
                {card.value}
              </p>
              <p className="mt-3 text-sm text-slate-500">{card.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserStatsCard;
