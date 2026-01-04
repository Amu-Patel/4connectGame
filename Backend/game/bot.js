import { checkWin } from "./gameLogic.js";

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function simulateMove(board, col, color) {
  const temp = cloneBoard(board);

  for (let r = 5; r >= 0; r--) {
    if (temp[r][col] === null) {
      temp[r][col] = color;
      return temp;
    }
  }
  return null;
}

function countWinningMoves(board, color) {
  let count = 0;
  for (let c = 0; c < 7; c++) {
    const temp = simulateMove(board, c, color);
    if (temp && checkWin(temp, color)) count++;
  }
  return count;
}

function botMove(board) {
  for (let c = 0; c < 7; c++) {
    const temp = simulateMove(board, c, "yellow");
    if (temp && checkWin(temp, "yellow")) return c;
  }

  for (let c = 0; c < 7; c++) {
    const temp = simulateMove(board, c, "red");
    if (temp && checkWin(temp, "red")) return c;
  }

  for (let c = 0; c < 7; c++) {
    const temp = simulateMove(board, c, "yellow");
    if (!temp) continue;

    const futureWins = countWinningMoves(temp, "yellow");
    if (futureWins >= 2) return c;
  }

  if (board[0][3] === null) return 3;

  for (let c = 0; c < 7; c++) {
    const temp = simulateMove(board, c, "yellow");
    if (!temp) continue;
    let opponentCanWin = false;
    for (let oc = 0; oc < 7; oc++) {
      const oppTemp = simulateMove(temp, oc, "red");
      if (oppTemp && checkWin(oppTemp, "red")) {
        opponentCanWin = true;
        break;
      }
    }

    if (!opponentCanWin) return c;
  }

  for (let c = 0; c < 7; c++) {
    if (board[0][c] === null) return c;
  }

  return null;
}

export { botMove };

/*A bot that “always wins” is not mathematically possible in Connect-4 against a 
perfect player, because Connect-4 is a solved game and the first player can force a win. */
