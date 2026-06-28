function normaliseText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

console.log(levenshteinDistance("duck", "dark")); // 2
console.log(levenshteinDistance("wots my age agian", "whats my age again"));
console.log(
  levenshteinDistance("awhats amy aage aagain", "whats my age again"),
);

function isCloseMatch(guess, answer) {
  const normalisedAnswer = normaliseText(answer);
  const normalisedGuess = normaliseText(guess);

  if (!normalisedAnswer || !normalisedGuess) return false;

  if (normalisedGuess === normalisedAnswer) return true;

  let distance = levenshteinDistance(normalisedGuess, normalisedAnswer);

  let allowedDistance;

  if (normalisedAnswer.length <= 5) {
    allowedDistance = 1;
  } else if (normalisedAnswer.length <= 10) {
    allowedDistance = 2;
  } else {
    allowedDistance = 4;
  }

  return distance <= allowedDistance;
}

console.log(isCloseMatch("duck", "dark")); // 2
console.log(isCloseMatch("wots my age agian", "whats my age again"));
console.log(isCloseMatch("awhats amy aage aagain", "whats my age again"));

module.exports = isCloseMatch;
