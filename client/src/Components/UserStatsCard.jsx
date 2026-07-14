function UserStatsCard(props) {
  const { stats } = props;

  const averageGuesstime =
    stats.totalGuesses > 0 ? stats.totalGuessTime / stats.totalGuesses : null;

  if (!stats) return <p> No stats available</p>;

  return (
    <div className="mt-4 space-y-2">
      <h2 className="text-xl font-semibold">{stats.username}</h2>
      <p>Total points: {stats.totalPoints}</p>
      <p>Games won: {stats.gamesWon}</p>
      <p>Total correct rounds: {stats.totalGuesses}</p>

      <p>
        Best guess time:{" "}
        {typeof stats.bestGuessTime === "number"
          ? `${(stats.bestGuessTime / 1000).toFixed(1)}s`
          : "No correct guesses... yet"}
      </p>

      <p>
        Average guess time:{" "}
        {typeof averageGuesstime === "number"
          ? `${(averageGuesstime / 1000).toFixed(1)}s`
          : "No correct guesses... yet"}
      </p>
    </div>
  );
}

export default UserStatsCard;
