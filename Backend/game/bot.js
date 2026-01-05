import { checkWin } from "./gameLogic.js";

const ROWS = 6;
const COLS = 7;
const BOT = "Yellow";
const PLAYER = "red";
const MAX_DEPTH = 7; 


function cloneBoard(board) {
  return board.map(row => [...row]);
}

function getValidMoves(board) {
  return [...Array(COLS).keys()].filter(c => board[0][c] === null);
}

function makeMove(board, col, color) {
  if (board[0][col] !== null) return null; 

  const temp = board.map(row => [...row]);

  for (let r = temp.length - 1; r >= 0; r--) {
    if (temp[r][col] === null) {
      temp[r][col] = color;
      return temp;
    }
  }

  return null;
}

function evaluateWindow(window, color) {
  let score = 0;
  const opp = color === BOT ? PLAYER : BOT;

  const countColor = window.filter(c => c === color).length;
  const countOpp = window.filter(c => c === opp).length;
  const empty = window.filter(c => c === null).length;

  if (countColor === 4) score += 100;
  else if (countColor === 3 && empty === 1) score += 10;
  else if (countColor === 2 && empty === 2) score += 5;

  if (countOpp === 3 && empty === 1) score -= 80;

  return score;
}

function scorePosition(board, color) {
  let score = 0;
  const center = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r++) {
    if (board[r][center] === color) score += 6;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = board[r].slice(c, c + 4);
      score += evaluateWindow(window, color);
    }
  }

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [
        board[r][c],
        board[r + 1][c],
        board[r + 2][c],
        board[r + 3][c],
      ];
      score += evaluateWindow(window, color);
    }
  }

  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [
        board[r][c],
        board[r - 1][c + 1],
        board[r - 2][c + 2],
        board[r - 3][c + 3],
      ];
      score += evaluateWindow(window, color);
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [
        board[r][c],
        board[r + 1][c + 1],
        board[r + 2][c + 2],
        board[r + 3][c + 3],
      ];
      score += evaluateWindow(window, color);
    }
  }

  return score;
}

function minimax(board, depth, alpha, beta, maximizing) {
  const validMoves = getValidMoves(board);

  if (checkWin(board, BOT)) return [null, 1000000];
  if (checkWin(board, PLAYER)) return [null, -1000000];
  if (validMoves.length === 0 || depth === 0)
    return [null, scorePosition(board, BOT)];

  if (maximizing) {
    let maxEval = -Infinity;
    let bestCol = validMoves[0];

    for (const col of validMoves) {
      const newBoard = makeMove(board, col, BOT);
      const [, evalScore] = minimax(newBoard, depth - 1, alpha, beta, false);

      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestCol = col;
      }

      alpha = Math.max(alpha, evalScore);
      if (alpha >= beta) break;
    }

    return [bestCol, maxEval];
  } else {
    let minEval = Infinity;
    let bestCol = validMoves[0];

    for (const col of validMoves) {
      const newBoard = makeMove(board, col, PLAYER);
      const [, evalScore] = minimax(newBoard, depth - 1, alpha, beta, true);

      if (evalScore < minEval) {
        minEval = evalScore;
        bestCol = col;
      }

      beta = Math.min(beta, evalScore);
      if (alpha >= beta) break;
    }

    return [bestCol, minEval];
  }
}

function botMove(board) {
  const [bestCol] = minimax(board, MAX_DEPTH, -Infinity, Infinity, true);
  return bestCol;
}

export { botMove };
