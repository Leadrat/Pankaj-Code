import { useState, useEffect } from "react";
import { GameBoard } from "./GameBoard";

interface ReplayViewerProps {
  moveHistory: Array<{
    playerId: string;
    cellIndex: number;
    symbol: string;
    timestamp: number;
  }>;
  players: Array<{
    userId: string;
    username: string;
    isReady: boolean;
  }>;
  onClose: () => void;
}

export function ReplayViewer({ moveHistory, players, onClose }: ReplayViewerProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds between moves

  // Create board state up to current move
  const board = Array(9).fill(null);
  for (let i = 0; i <= currentMoveIndex; i++) {
    if (moveHistory[i]) {
      board[moveHistory[i].cellIndex] = moveHistory[i].symbol;
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentMoveIndex < moveHistory.length - 1) {
        setCurrentMoveIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentMoveIndex, moveHistory.length, speed]);

  const handlePlay = () => {
    if (currentMoveIndex >= moveHistory.length - 1) {
      setCurrentMoveIndex(-1);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (currentMoveIndex < moveHistory.length - 1) {
      setCurrentMoveIndex(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentMoveIndex >= 0) {
      setCurrentMoveIndex(prev => prev - 1);
    }
  };

  const getCurrentMove = () => {
    if (currentMoveIndex >= 0 && currentMoveIndex < moveHistory.length) {
      return moveHistory[currentMoveIndex];
    }
    return null;
  };

  const currentMove = getCurrentMove();
  const currentPlayer = currentMove ? players.find(p => p.userId === currentMove.playerId) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card-strong rounded-3xl p-6 float-animation">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Match Replay</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 glass-card text-white rounded-2xl hover:bg-white/30 transition-all duration-300"
          >
            Close Replay
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="glass-card-strong rounded-3xl p-6 float-animation">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">
            {currentMoveIndex === -1 && "Game Start"}
            {currentMove && `Move ${currentMoveIndex + 1}: ${currentPlayer?.username} played ${currentMove.symbol}`}
            {currentMoveIndex >= moveHistory.length - 1 && moveHistory.length > 0 && " - Game End"}
          </h3>
          <p className="text-white/80">
            Move {Math.max(0, currentMoveIndex + 1)} of {moveHistory.length}
          </p>
        </div>

        <GameBoard
          board={board}
          onCellClick={() => {}}
          disabled={true}
          lastMove={currentMove || undefined}
        />
      </div>

      {/* Controls */}
      <div className="glass-card-strong rounded-3xl p-6 float-animation">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <button
            onClick={handleStepBackward}
            disabled={currentMoveIndex < 0}
            className="px-4 py-2 glass-card text-white rounded-2xl hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏮ Step Back
          </button>
          
          <button
            onClick={handlePlay}
            className="px-6 py-2 gradient-button-purple rounded-2xl"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          
          <button
            onClick={handleStepForward}
            disabled={currentMoveIndex >= moveHistory.length - 1}
            className="px-4 py-2 glass-card text-white rounded-2xl hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Step Forward ⏭
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300"
          >
            🔄 Reset
          </button>
        </div>

        {/* Speed Control */}
        <div className="text-center">
          <label className="block text-sm font-medium text-white mb-2">
            Playback Speed
          </label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="px-3 py-2 rounded-2xl glass-card text-white bg-white/20 border border-white/30 focus:ring-2 focus:ring-white/30 focus:border-white/50 outline-none"
          >
            <option value={2000} className="bg-gray-800">0.5x (Slow)</option>
            <option value={1000} className="bg-gray-800">1x (Normal)</option>
            <option value={500} className="bg-gray-800">2x (Fast)</option>
            <option value={250} className="bg-gray-800">4x (Very Fast)</option>
          </select>
        </div>
      </div>

      {/* Move History */}
      <div className="glass-card-strong rounded-3xl p-6 float-animation">
        <h3 className="text-lg font-bold text-white mb-4">Move History</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {moveHistory.map((move, index) => {
            const player = players.find(p => p.userId === move.playerId);
            const isCurrentMove = index === currentMoveIndex;
            
            return (
              <div
                key={index}
                className={`flex justify-between items-center p-2 rounded-xl transition-all duration-300 ${
                  isCurrentMove ? "glass-card-strong border border-white/40" : "glass-card"
                }`}
              >
                <span className="font-medium text-white">
                  Move {index + 1}: {player?.username} ({move.symbol})
                </span>
                <span className="text-sm text-white/70">
                  Cell {move.cellIndex + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
