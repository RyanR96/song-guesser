class GameEngine {
  constructor() {
    this.isPlaying = false;
    this.currentSong = null;
    this.currentRound = 0;
    this.totalRounds = 15;
    this.players = {};
    this.correctGuessesThisRound = [];
    this.roundStartTime = null;
    this.timer = null;
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
    this.nextRound();

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
    if (this.correctGuessesThisRound.includes(username))
      return { error: "You've already guessed correctly this round!" };
    if (guess.toLowerCase() === this.currentSong.title.toLowerCase()) {
      this.correctGuessesThisRound.push(username);
      let points = 10;
      this.players[username].score += points;
      // Add points based on time they got answer right, aka change it later

      return { correct: true, score: this.players[username].score };
    }

    return { correct: false };
  }

  nextRound() {
    this.correctGuessesThisRound = [];
    if (!this.songs) return false;
    if (this.currentRound + 1 > this.songs.length) {
      this.isPlaying = false;
      return false;
    }

    this.currentRound++;
    this.currentSong = this.songs[this.currentRound - 1];
    console.log("Current song: ", this.currentSong);

    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.nextRound();
    }, 5000);
    return true; // This could be removed, as API wont be hitting this function in future
  }

  get currentRoundNumber() {
    return this.currentRound;
  }
}

module.exports = new GameEngine();
