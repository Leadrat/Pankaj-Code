interface GameBoardProps {
  board: (string | null)[];
  onCellClick: (index: number) => void;
  disabled: boolean;
  lastMove?: {
    cellIndex: number;
    symbol: string;
    playerId: string;
    timestamp: number;
  };
}

export function GameBoard({ board, onCellClick, disabled, lastMove }: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
      {board.map((cell, index) => (
        <button
          key={index}
          onClick={() => onCellClick(index)}
          disabled={disabled || cell !== null}
          className={`
            aspect-square flex items-center justify-center text-4xl font-bold
            rounded-2xl transition-all duration-300
            ${cell === null && !disabled
              ? "game-cell hover:scale-105 cursor-pointer"
              : "game-cell cursor-not-allowed opacity-80"
            }
            ${lastMove?.cellIndex === index ? "ring-4 ring-yellow-400/60 bg-yellow-200/20" : ""}
            ${cell === "X" ? "text-blue-300" : "text-pink-300"}
          `}
        >
          {cell && (
            <span className={`${lastMove?.cellIndex === index ? "animate-pulse" : ""} drop-shadow-lg`}>
              {cell}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
