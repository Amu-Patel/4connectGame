// bot.js
import { checkWin } from "./gameLogic.js";

function cloneBoard(board) {
  return board.map(row => [...row]);
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

// Optional smarter bot strategy (commented out)
// function botMove(board) {
//   // 1️⃣ WIN
//   for (let c = 0; c < 7; c++) {
//     const temp = simulateMove(board, c, "yellow");
//     if (temp && checkWin(temp, "yellow")) return c;
//   }

//   // 2️⃣ BLOCK
//   for (let c = 0; c < 7; c++) {
//     const temp = simulateMove(board, c, "red");
//     if (temp && checkWin(temp, "red")) return c;
//   }

//   // 3️⃣ CENTER
//   if (board[0][3] === null) return 3;

//   // 4️⃣ FIRST AVAILABLE
//   for (let c = 0; c < 7; c++) {
//     if (board[0][c] === null) return c;
//   }

//   return null;
// }

function botMove(board) {
  const validColumns = board[0]
    .map((_, i) => i)
    .filter((c) => board[0][c] === null);

  if (validColumns.length === 0) return null;

  return validColumns[Math.floor(Math.random() * validColumns.length)];
}

export { botMove };
