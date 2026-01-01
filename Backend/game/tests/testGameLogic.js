const {
  createBoard,
  dropDisc,
  checkWin,
  checkDraw
} = require("../gameLogic");

console.log("=== TEST STARTED ===");

// Create board
const board = createBoard();
console.log("Initial Board:");
console.table(board);

// Horizontal win test
dropDisc(board, 0, "R");
dropDisc(board, 1, "R");
dropDisc(board, 2, "R");
dropDisc(board, 3, "R");

console.log("Board After Moves:");
console.table(board);

// Win check
console.log("R wins?", checkWin(board, "R")); // should be true

// Draw check
console.log("Draw?", checkDraw(board)); // should be false

console.log("=== TEST ENDED ===");
