class GameEngine {
  constructor() {
    this.isPlaying = false;
    this.currentSong = null;
    this.currentRound = 0;
    this.totalRounds = 15;
    this.players = {};
  }

  startGame(songs) {
    this.isPlaying = true;
    this.songs = songs;
    this.currentRound = 1;
    this.currentSong = songs[0];
  }

  submitGuess(username, guess) {
    if (!this.isPlaying) return { error: "Game not underway" };
    if (guess.toLowerCase() === this.currentSong.title.toLowerCase()) {
      return { correct: true };
    }

    return { correct: false };
  }
}

module.exports = GameEngine;
