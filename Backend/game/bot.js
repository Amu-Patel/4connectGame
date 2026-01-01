function botMove(board) {
  const valid = board[0]
    .map((_, i) => i)
    .filter((c) => board[0][c] === null);

  return valid[Math.floor(Math.random() * valid.length)];
}

module.exports = { botMove };
