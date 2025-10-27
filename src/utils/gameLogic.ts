export type Board = (string | null)[][];
export type Player = 'X' | 'O';

export const createEmptyBoard = (): Board => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

export const checkWinner = (board: Board): { winner: Player | 'draw' | null; line?: number[][] } => {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
      return {
        winner: board[i][0] as Player,
        line: [[i, 0], [i, 1], [i, 2]]
      };
    }
  }

  // Check columns
  for (let i = 0; i < 3; i++) {
    if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
      return {
        winner: board[0][i] as Player,
        line: [[0, i], [1, i], [2, i]]
      };
    }
  }

  // Check diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return {
      winner: board[0][0] as Player,
      line: [[0, 0], [1, 1], [2, 2]]
    };
  }

  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return {
      winner: board[0][2] as Player,
      line: [[0, 2], [1, 1], [2, 0]]
    };
  }

  // Check for draw
  const isFull = board.every(row => row.every(cell => cell !== null));
  if (isFull) {
    return { winner: 'draw' };
  }

  return { winner: null };
};

export const getAIMove = (board: Board, difficulty: 'easy' | 'medium' | 'hard', aiPlayer: Player): { row: number; col: number } => {
  if (difficulty === 'easy') {
    return getRandomMove(board);
  } else if (difficulty === 'medium') {
    return getMediumMove(board, aiPlayer);
  } else {
    return getBestMove(board, aiPlayer);
  }
};

const getRandomMove = (board: Board): { row: number; col: number } => {
  const available: { row: number; col: number }[] = [];
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) {
        available.push({ row: i, col: j });
      }
    }
  }
  
  return available[Math.floor(Math.random() * available.length)];
};

const getMediumMove = (board: Board, aiPlayer: Player): { row: number; col: number } => {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  
  // Try to win
  const winMove = findWinningMove(board, aiPlayer);
  if (winMove) return winMove;
  
  // Block opponent
  const blockMove = findWinningMove(board, opponent);
  if (blockMove) return blockMove;
  
  // Random move
  return getRandomMove(board);
};

const findWinningMove = (board: Board, player: Player): { row: number; col: number } | null => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) {
        const testBoard = board.map(row => [...row]);
        testBoard[i][j] = player;
        if (checkWinner(testBoard).winner === player) {
          return { row: i, col: j };
        }
      }
    }
  }
  return null;
};

const getBestMove = (board: Board, aiPlayer: Player): { row: number; col: number } => {
  let bestScore = -Infinity;
  let bestMove = { row: 0, col: 0 };
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) {
        const testBoard = board.map(row => [...row]);
        testBoard[i][j] = aiPlayer;
        const score = minimax(testBoard, 0, false, aiPlayer);
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = { row: i, col: j };
        }
      }
    }
  }
  
  return bestMove;
};

const minimax = (board: Board, depth: number, isMaximizing: boolean, aiPlayer: Player): number => {
  const result = checkWinner(board);
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  
  if (result.winner === aiPlayer) return 10 - depth;
  if (result.winner === opponent) return depth - 10;
  if (result.winner === 'draw') return 0;
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          const testBoard = board.map(row => [...row]);
          testBoard[i][j] = aiPlayer;
          const score = minimax(testBoard, depth + 1, false, aiPlayer);
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          const testBoard = board.map(row => [...row]);
          testBoard[i][j] = opponent;
          const score = minimax(testBoard, depth + 1, true, aiPlayer);
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
};
