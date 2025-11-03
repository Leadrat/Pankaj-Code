import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Board } from "@/utils/gameLogic";

interface GameBoardProps {
  board: Board;
  onCellClick: (row: number, col: number) => void;
  winningLine?: number[][];
  disabled?: boolean;
}

export const GameBoard = ({ board, onCellClick, winningLine, disabled }: GameBoardProps) => {
  const isWinningCell = (row: number, col: number) => {
    return winningLine?.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <motion.button
            key={`${rowIndex}-${colIndex}`}
            whileHover={!disabled && !cell ? { scale: 1.05 } : {}}
            whileTap={!disabled && !cell ? { scale: 0.95 } : {}}
            onClick={() => !disabled && !cell && onCellClick(rowIndex, colIndex)}
            disabled={disabled || !!cell}
            className={cn(
              "aspect-square glass-effect rounded-2xl flex items-center justify-center",
              "text-5xl md:text-6xl font-bold transition-all duration-300",
              !cell && !disabled && "cell-hover cursor-pointer",
              isWinningCell(rowIndex, colIndex) && "winner-pulse",
              cell === 'X' && "text-primary",
              cell === 'O' && "text-destructive"
            )}
          >
            {cell && (
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {cell}
              </motion.span>
            )}
          </motion.button>
        ))
      )}
    </div>
  );
};
