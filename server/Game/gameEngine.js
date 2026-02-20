class GameEngine {
  constructor() {
    this.isPlaying = false;
    this.currentSong = null;
    this.currentRound = 0;
    this.totalRounds = 15;
    this.players = {};
  }

  startGame(songs) {
    if (!songs || songs.length === 0) {
      return false;
    }

    if (this.isPlaying) {
      return false;
    }

    this.isPlaying = true;
    this.songs = songs;
    this.currentRound = 1;
    this.currentSong = songs[0];

    return true;
  }

  joinGame(username) {
    if (!username) {
      return { error: "Username required" };
    }

    if (this.players[username]) {
      return { error: "Username already exists" };
    }

    this.players[username] = { score: 0 };
    console.log(this.players);

    return { success: true };
  }

  submitGuess(username, guess) {
    if (!this.isPlaying) return { error: "Game not underway" };
    if (guess.toLowerCase() === this.currentSong.title.toLowerCase()) {
      return { correct: true };
    }

    return { correct: false };
  }

  nextRound() {
    if (!this.songs) return false;
    if (this.currentRound + 1 > this.songs.length) return false;
    this.currentRound++;
    return true;
  }

  get currentRoundNumber() {
    return this.currentRound;
  }
}

module.exports = new GameEngine();
