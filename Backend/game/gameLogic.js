const ROWS = 6;
const COLS = 7;
function createBoard() {
  return Array.from({ length: ROWS }, () =>
    Array(COLS).fill(null)
  );
}
function dropDisc(board, col, player) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      board[row][col] = player;
      return row;
    }
  }
  return -1;
}
function checkWin(board, player) {
  const directions = [
    [0, 1],   
    [1, 0],   
    [1, 1],  
    [-1, 1], 
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      for (let [dr, dc] of directions) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (
            nr < 0 || nr >= ROWS ||
            nc < 0 || nc >= COLS ||
            board[nr][nc] !== player
          ) break;

          count++;
        }
        if (count === 4) return true;
      }
    }
  }
  return false;
}
function checkDraw(board) {
  return board[0].every(cell => cell !== null);
}
export { ROWS, COLS, createBoard, dropDisc, checkWin, checkDraw };
