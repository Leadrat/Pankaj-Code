import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import '../styles/Game.css';

const Game = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState('single'); // 'single' or 'two'
  const [gameStatus, setGameStatus] = useState(null); // 'X', 'O', 'Draw', or null
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModeSelect, setShowModeSelect] = useState(true);
  const navigate = useNavigate();

  // Minimax algorithm for AI
  const minimax = (board, isMaximizing, depth = 0) => {
    const winner = calculateWinner(board);
    
    if (winner === 'O') return 10 - depth; // AI wins
    if (winner === 'X') return depth - 10; // Player wins
    if (board.every(cell => cell !== null)) return 0; // Draw
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = minimax(board, false, depth + 1);
          board[i] = null;
          bestScore = Math.max(bestScore, score);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = minimax(board, true, depth + 1);
          board[i] = null;
          bestScore = Math.min(bestScore, score);
        }
      }
      return bestScore;
    }
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || isGameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    checkGameStatus(newBoard, !isXNext);
  };

  const checkGameStatus = (currentBoard, wasXTurn) => {
    const winner = calculateWinner(currentBoard);
    
    if (winner) {
      setGameStatus(winner);
      setIsGameOver(true);
      handleGameEnd(winner);
    } else if (currentBoard.every(cell => cell !== null)) {
      setGameStatus('Draw');
      setIsGameOver(true);
      handleGameEnd('Draw');
    }
  };

  const handleGameEnd = async (result) => {
    try {
      let scoreResult;
      if (gameMode === 'single') {
        // In single player, X is player, O is AI
        scoreResult = result === 'X' ? 'Win' : result === 'O' ? 'Loss' : 'Draw';
      } else {
        // In two player mode, the current player wins or draw
        scoreResult = result === 'Draw' ? 'Draw' : 'Win';
      }

      await axios.post('http://localhost:5000/api/game/submit-score', {
        gameMode: gameMode === 'single' ? 'SinglePlayer' : 'TwoPlayer',
        result: scoreResult
      });
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  // AI move
  useEffect(() => {
    if (gameMode === 'single' && !isXNext && !isGameOver) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, gameMode, isGameOver]);

  const makeAIMove = () => {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = 'O';
        const score = minimax(newBoard, false);
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    if (bestMove !== null) {
      handleClick(bestMove);
    }
  };

  const startGame = (mode) => {
    setGameMode(mode);
    setShowModeSelect(false);
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus(null);
    setIsGameOver(false);
  };

  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus(null);
    setIsGameOver(false);
  };

  const backToModeSelect = () => {
    setShowModeSelect(true);
    restartGame();
  };

  const renderSquare = (index) => {
    return (
      <button
        className="square"
        onClick={() => handleClick(index)}
        disabled={isGameOver}
      >
        {board[index]}
      </button>
    );
  };

  const getStatusMessage = () => {
    if (!gameStatus && !isGameOver) {
      return `Current Player: ${isXNext ? 'X' : 'O'}`;
    }
    if (gameStatus === 'Draw') {
      return 'Game Draw!';
    }
    return `${gameStatus} Won!`;
  };

  if (showModeSelect) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Select Game Mode
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => startGame('single')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
              >
                Single Player (vs AI)
              </button>
              <button
                onClick={() => startGame('two')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
              >
                Two Player (Local)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {gameMode === 'single' ? 'Single Player Mode' : 'Two Player Mode'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {getStatusMessage()}
            </p>
          </div>

          <div className="board">
            {[0, 1, 2].map((row) => (
              <div key={row} className="board-row">
                {[0, 1, 2].map((col) => renderSquare(row * 3 + col))}
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={restartGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-300"
            >
              Restart Game
            </button>
            <button
              onClick={backToModeSelect}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition duration-300"
            >
              Change Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;


