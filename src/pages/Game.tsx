import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameBoard } from "@/components/GameBoard";
import { MoveLog } from "@/components/MoveLog";
import { ReplayControls } from "@/components/ReplayControls";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import {
  createEmptyBoard,
  checkWinner,
  getAIMove,
  type Board,
  type Player,
} from "@/utils/gameLogic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Game = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [gameMode, setGameMode] = useState<"ai" | "two_player" | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [winningLine, setWinningLine] = useState<number[][] | undefined>();
  const [moves, setMoves] = useState<any[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerSymbol] = useState<Player>("X");
  const [replayMode, setReplayMode] = useState(false);
  const [replayMoveIndex, setReplayMoveIndex] = useState(0);
  const [isReplayPlaying, setIsReplayPlaying] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (gameMode === "ai" && currentPlayer !== playerSymbol && !gameOver && !replayMode) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, gameOver, replayMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isReplayPlaying && replayMoveIndex < moves.length) {
      interval = setInterval(() => {
        setReplayMoveIndex((prev) => {
          if (prev >= moves.length - 1) {
            setIsReplayPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isReplayPlaying, replayMoveIndex, moves.length]);

  useEffect(() => {
    if (replayMode) {
      const replayBoard = createEmptyBoard();
      moves.slice(0, replayMoveIndex + 1).forEach((move) => {
        replayBoard[move.row][move.col] = move.player;
      });
      setBoard(replayBoard);
    }
  }, [replayMoveIndex, replayMode, moves]);

  const startGame = async (mode: "ai" | "two_player") => {
    setGameMode(mode);
    setBoard(createEmptyBoard());
    setCurrentPlayer("X");
    setGameOver(false);
    setWinner(null);
    setWinningLine(undefined);
    setMoves([]);
    setReplayMode(false);
    setReplayMoveIndex(0);

    try {
      const { data, error } = await supabase
        .from("games")
        .insert({
          player_id: user.id,
          mode,
          difficulty: mode === "ai" ? difficulty : null,
          player_symbol: playerSymbol,
        })
        .select()
        .single();

      if (error) throw error;
      setGameId(data.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start game",
        variant: "destructive",
      });
    }
  };

  const handleCellClick = async (row: number, col: number) => {
    if (gameOver || replayMode) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const newMove = {
      player: currentPlayer,
      row,
      col,
      moveIndex: moves.length,
    };
    setMoves([...moves, newMove]);

    try {
      await supabase.from("moves").insert({
        game_id: gameId,
        player: currentPlayer,
        row,
        col,
        move_index: moves.length,
      });
    } catch (error) {
      console.error("Failed to save move:", error);
    }

    const result = checkWinner(newBoard);
    if (result.winner) {
      endGame(result.winner, result.line);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const makeAIMove = async () => {
    const aiPlayer = playerSymbol === "X" ? "O" : "X";
    const move = getAIMove(board, difficulty, aiPlayer);
    await handleCellClick(move.row, move.col);
  };

  const endGame = async (gameWinner: Player | "draw", line?: number[][]) => {
    setGameOver(true);
    setWinner(gameWinner);
    setWinningLine(line);

    const result =
      gameWinner === "draw"
        ? "draw"
        : gameWinner === playerSymbol
        ? "win"
        : "loss";

    try {
      await supabase
        .from("games")
        .update({
          result,
          winner: gameWinner === "draw" ? "draw" : gameWinner,
        })
        .eq("id", gameId);

      toast({
        title:
          gameWinner === "draw"
            ? "Draw!"
            : gameWinner === playerSymbol
            ? "You Win!"
            : "You Lose!",
      });
    } catch (error) {
      console.error("Failed to update game:", error);
    }
  };

  const toggleReplayMode = () => {
    if (!replayMode && moves.length > 0) {
      setReplayMode(true);
      setReplayMoveIndex(0);
    } else {
      setReplayMode(false);
      setReplayMoveIndex(moves.length - 1);
    }
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full space-y-6"
        >
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="glass-effect rounded-2xl p-8 space-y-6">
            <h2 className="text-4xl font-bold text-center mb-8">Choose Game Mode</h2>

            <div className="space-y-4">
              <div className="glass-effect p-6 rounded-xl space-y-4">
                <h3 className="text-2xl font-bold">AI Opponent</h3>
                <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard (Unbeatable)</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full neon-glow" onClick={() => startGame("ai")}>
                  Play vs AI
                </Button>
              </div>

              <div className="glass-effect p-6 rounded-xl space-y-4">
                <h3 className="text-2xl font-bold">Two Player</h3>
                <p className="text-muted-foreground">Play locally with a friend</p>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => startGame("two_player")}
                >
                  Two Player Mode
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setGameMode(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
            <Trophy className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-effect rounded-2xl p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">
                {gameOver
                  ? winner === "draw"
                    ? "Draw!"
                    : `${winner} Wins!`
                  : replayMode
                  ? "Replay Mode"
                  : `Current Turn: ${currentPlayer}`}
              </h2>
              <p className="text-muted-foreground">
                {gameMode === "ai" ? `AI Difficulty: ${difficulty}` : "Two Player Mode"}
              </p>
            </div>

            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              winningLine={winningLine}
              disabled={gameOver || replayMode}
            />

            {gameOver && (
              <div className="flex gap-4 justify-center">
                <Button className="neon-glow" onClick={() => setGameMode(null)}>
                  Play Again
                </Button>
                <Button variant="secondary" onClick={toggleReplayMode}>
                  {replayMode ? "Exit Replay" : "Watch Replay"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <MoveLog moves={moves} />
            {moves.length > 0 && (
              <ReplayControls
                currentMove={replayMoveIndex}
                totalMoves={moves.length - 1}
                isPlaying={isReplayPlaying}
                onPlayPause={() => setIsReplayPlaying(!isReplayPlaying)}
                onReset={() => setReplayMoveIndex(0)}
                onMoveChange={setReplayMoveIndex}
                onStepBack={() => setReplayMoveIndex(Math.max(0, replayMoveIndex - 1))}
                onStepForward={() =>
                  setReplayMoveIndex(Math.min(moves.length - 1, replayMoveIndex + 1))
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
