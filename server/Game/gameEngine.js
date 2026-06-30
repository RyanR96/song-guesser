const isCloseMatch = require("./matching");

class GameEngine {
  constructor() {
    this.isPlaying = false;
    this.currentSong = null;
    this.currentRound = 0;
    this.totalRounds = 15;
    this.players = {};
    //this.correctGuessesThisRound = [];
    this.roundGuessProgress = {};
    this.bothGuessesCorrect = 0;
    this.roundStartTime = null;
    this.roundDuration = 5000;
    this.timer = null;
    this.songs = [];
    this.onStateChange = null;
    this.onGameOver = null;
    // Prep phase (Time inbetween songs playing)
    this.roundPrepDuration = 3000;
    this.prepTimer = null;
    this.roundPhase = null;
    this.prepStartTime = null;
  }

  startGame(songs) {
    if (!songs || songs.length === 0) {
      return false;
    }

    if (this.isPlaying) {
      return false;
    }

    //reset game

    if (this.timer) clearTimeout(this.timer);
    if (this.prepTimer) clearTimeout(this.prepTimer);

    this.currentRound = 0;
    this.currentSong = null;
    this.roundGuessProgress = {};
    this.bothGuessesCorrect = 0;
    this.timer = null;
    this.prepTimer = null;
    this.prepStartTime = null;
    this.roundStartTime = null;
    this.roundPhase = null;
    // optional, will need to reset scores though: this.players = {};
    for (const username in this.players) {
      this.players[username].score = 0;
    }

    this.isPlaying = true;
    this.songs = songs;
    this.nextRound();

    return true;
  }

  joinGame({ username, isRegistered, userId }) {
    if (!username) {
      return { error: "Username required" };
    }

    if (this.players[username]) {
      return { error: "Username already in the game" };
    }

    //Code for reconnected, don't need now

    this.players[username] = {
      score: 0,
      isRegistered,
      userId,
    };
    console.log(this.players);

    return { success: true };
  }

  submitGuess(username, guess) {
    if (!this.isPlaying)
      return { correct: false, message: "Game not underway" };
    if (!this.players[username])
      return { correct: false, message: "Player not in game" };

    if (!this.roundGuessProgress[username]) {
      this.roundGuessProgress[username] = {
        titleCorrect: false,
        artistCorrect: false,
        bothCorrect: false,
        bothCorrectTime: null,
        finishedPosition: null,
      };
    }

    const progress = this.roundGuessProgress[username];

    if (progress.bothCorrect) {
      return {
        correct: false,
        message: "You've already guessed correctly this round!",
      };
    }

    let points = 0;
    let message = "";

    if (!progress.titleCorrect && isCloseMatch(guess, this.currentSong.title)) {
      progress.titleCorrect = true;
      points += 1;
      message = "Correct title, now get the artist name";
    } else if (!progress.artistCorrect) {
      const artistCorrect = this.currentSong.artist.some(artist =>
        isCloseMatch(guess, artist),
      );

      if (artistCorrect) {
        progress.artistCorrect = true;
        points += 1;
        message = "Correct artist, now get the song title";
      }
    }

    if (points === 0) {
      return { correct: false, message: "Wrong answer!" };
    }

    if (
      progress.titleCorrect &&
      progress.artistCorrect &&
      !progress.bothCorrect
    ) {
      progress.bothCorrect = true;
      progress.bothCorrectTime = this.roundStartTime
        ? Date.now() - this.roundStartTime
        : 0;
      this.bothGuessesCorrect++;

      progress.finishedPosition = this.bothGuessesCorrect;

      points += 2;
      // bonus points for those that finished 1st/2nd. Add bonus points later for those that guess quickly
      if (progress.finishedPosition === 1) {
        points += 2;
        message = "Correct, you were first";
      } else if (progress.finishedPosition === 2) {
        points += 1;
        message = "Correct, you were second";
      } else {
        message = "Correct, you got both the artist and title";
      }
    }

    this.players[username].score += points;

    return {
      correct: true,
      message,
      pointsAwarded: points,
      score: this.players[username].score,
      progress: {
        titleCorrect: progress.titleCorrect,
        artistCorrect: progress.artistCorrect,
        bothCorrect: progress.bothCorrect,
        bothCorrectTime: progress.bothCorrectTime,
        finishedPosition: progress.finishedPosition,
      },
    };
  }

  nextRound() {
    this.roundGuessProgress = {};
    this.bothGuessesCorrect = 0;

    if (!this.songs) return false;

    if (this.currentRound + 1 > this.songs.length) {
      this.endGame();
      return;
    }

    this.currentRound++;
    this.currentSong = this.songs[this.currentRound - 1];
    console.log("Current song: ", this.currentSong);
    this.roundPhase = "preparing";
    this.roundStartTime = Date.now();

    if (this.timer) clearTimeout(this.timer);
    if (this.prepTimer) clearTimeout(this.prepTimer);

    this.prepTimer = setTimeout(() => {
      this.startRound();
    }, this.roundPrepDuration);

    if (this.onStateChange) this.onStateChange(this.getState());
    return true; // This could be removed, as API wont be hitting this function in future
  }

  startRound() {
    if (!this.isPlaying || !this.currentSong) return false;

    this.roundStartTime = Date.now();

    if (this.timer) clearTimeout(this.timer);

    this.roundPhase = "playing";

    this.timer = setTimeout(() => {
      this.nextRound();
    }, this.roundDuration);

    if (this.onStateChange) this.onStateChange(this.getState());
  }

  endGame() {
    if (this.timer) clearTimeout(this.timer);
    if (this.prepTimer) clearTimeout(this.prepTimer);

    this.timer = null;
    this.prepTimer = null;
    this.isPlaying = false;
    this.roundPhase = null;
    const leaderboard = this.getLeaderboard();
    console.log("Game ended");
    console.log(leaderboard);
    console.log(this.players);

    if (this.onStateChange) this.onStateChange(this.getState());
    if (this.onGameOver) {
      this.onGameOver({
        leaderboard,
        players: this.players,
      });
    }
    return { leaderboard };
  }

  leaveGame(username) {
    if (!username || !this.players[username]) {
      return false;
    }

    delete this.players[username];
    return true;
  }

  get currentRoundNumber() {
    return this.currentRound;
  }

  getLeaderboard() {
    return Object.entries(this.players)
      .sort((a, b) => b[1].score - a[1].score)
      .map(([username, data]) => ({ username, score: data.score }));
  }

  getState() {
    if (!this.isPlaying) {
      return {
        isPlaying: false,
        round: this.currentRound,
        roundPhase: this.roundPhase,
        leaderboard: this.getLeaderboard(),
      };
    }
    let timeLeft = 0;
    let prepTime = 0;

    if (this.roundPhase === "playing") {
      const elapsed = Date.now() - (this.roundStartTime || Date.now());
      timeLeft = Math.max(0, this.roundDuration - elapsed);
    }

    if (this.roundPhase === "preparing") {
      const elapsed = Date.now() - (this.prepStartTime || Date.now());
      prepTime = Math.max(0, this.roundPrepDuration - elapsed);
    }

    return {
      isPlaying: true,
      round: this.currentRound,
      roundPhase: this.roundPhase,
      timeLeft,
      prepTime,
      playersCount: Object.keys(this.players).length,
      leaderboard: this.getLeaderboard(),
      previewUrl: this.currentSong.previewUrl,
    };
  }
}

module.exports = new GameEngine();
