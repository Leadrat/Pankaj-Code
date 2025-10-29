import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GameBoard } from "./GameBoard";
import { ReplayViewer } from "./ReplayViewer";

interface GameRoomProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export function GameRoom({ roomId, onLeaveRoom }: GameRoomProps) {
  const room = useQuery(api.games.getRoom, { roomId });
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const toggleReady = useMutation(api.games.toggleReady);
  const leaveRoom = useMutation(api.games.leaveRoom);
  const makeMove = useMutation(api.games.makeMove);
  
  const [showReplay, setShowReplay] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentPlayer = room?.players.find(p => p.userId === loggedInUser?._id);
  const otherPlayer = room?.players.find(p => p.userId !== loggedInUser?._id);
  const isCurrentPlayerTurn = room?.currentTurn === loggedInUser?._id;
  const playerSymbol = room?.players.findIndex(p => p.userId === loggedInUser?._id) === 0 ? "X" : "O";

  useEffect(() => {
    if (room?.status === "finished") {
      const winner = room.winner;
      if (winner === "draw") {
        toast.info("Game ended in a draw!");
      } else if (winner === loggedInUser?._id) {
        toast.success("🎉 You won!");
      } else {
        toast.error("You lost. Better luck next time!");
      }
    }
  }, [room?.status, room?.winner, loggedInUser?._id]);

  const handleToggleReady = async () => {
    try {
      await toggleReady({ roomId });
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle ready status");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom({ roomId });
      onLeaveRoom();
    } catch (error: any) {
      toast.error(error.message || "Failed to leave room");
    }
  };

  const handleMakeMove = async (cellIndex: number) => {
    try {
      await makeMove({ roomId, cellIndex });
    } catch (error: any) {
      toast.error(error.message || "Invalid move");
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Room ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy room ID");
    }
  };

  if (!room) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="glass-card rounded-3xl p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80">Loading room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showReplay && room.status === "finished") {
    return (
      <ReplayViewer
        moveHistory={room.moveHistory}
        players={room.players}
        onClose={() => setShowReplay(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Room Header */}
      <div className="glass-card-strong rounded-3xl p-6 float-animation">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Room: {roomId}</h2>
            <p className="text-white/80">
              {room.status === "waiting" && "Waiting for players..."}
              {room.status === "playing" && "Game in progress"}
              {room.status === "finished" && "Game finished"}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyRoomId}
              className="px-4 py-2 glass-card text-white rounded-2xl hover:bg-white/30 transition-all duration-300"
            >
              {copied ? "Copied!" : "Copy ID"}
            </button>
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300"
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-2 gap-4">
          {room.players.map((player, index) => (
            <div
              key={player.userId}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                room.currentTurn === player.userId
                  ? "border-white/60 glass-card-strong"
                  : "border-white/30 glass-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">
                    {player.username} ({index === 0 ? "X" : "O"})
                  </p>
                  {player.userId === loggedInUser?._id && (
                    <span className="text-sm text-blue-300">(You)</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {room.status === "waiting" && (
                    <span
                      className={`px-2 py-1 rounded-xl text-xs font-medium ${
                        player.isReady
                          ? "bg-green-500/30 text-green-200 border border-green-400/50"
                          : "bg-yellow-500/30 text-yellow-200 border border-yellow-400/50"
                      }`}
                    >
                      {player.isReady ? "Ready" : "Not Ready"}
                    </span>
                  )}
                  {room.status === "playing" && room.currentTurn === player.userId && (
                    <span className="px-2 py-1 bg-blue-500/30 text-blue-200 border border-blue-400/50 rounded-xl text-xs font-medium">
                      Your Turn
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ready Button */}
        {room.status === "waiting" && currentPlayer && (
          <div className="mt-4 text-center">
            <button
              onClick={handleToggleReady}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                currentPlayer.isReady
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg"
                  : "gradient-button-purple"
              }`}
            >
              {currentPlayer.isReady ? "Cancel Ready" : "Ready to Play"}
            </button>
          </div>
        )}
      </div>

      {/* Game Board */}
      {room.status === "playing" && (
        <div className="glass-card-strong rounded-3xl p-6 float-animation">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              {isCurrentPlayerTurn ? "Your Turn" : `${otherPlayer?.username}'s Turn`}
            </h3>
            <p className="text-white/80">You are playing as {playerSymbol}</p>
          </div>
          <GameBoard
            board={room.board}
            onCellClick={handleMakeMove}
            disabled={!isCurrentPlayerTurn}
            lastMove={room.moveHistory[room.moveHistory.length - 1]}
          />
        </div>
      )}

      {/* Game Result */}
      {room.status === "finished" && (
        <div className="glass-card-strong rounded-3xl p-6 text-center float-animation">
          <h3 className="text-2xl font-bold mb-4 text-white">
            {room.winner === "draw" && "It's a Draw!"}
            {room.winner === loggedInUser?._id && "🎉 You Won!"}
            {room.winner !== "draw" && room.winner !== loggedInUser?._id && "You Lost"}
          </h3>
          
          <GameBoard
            board={room.board}
            onCellClick={() => {}}
            disabled={true}
            lastMove={room.moveHistory[room.moveHistory.length - 1]}
          />

          <div className="mt-6 space-x-4">
            <button
              onClick={() => setShowReplay(true)}
              className="px-6 py-3 gradient-button-purple rounded-2xl"
            >
              Watch Replay
            </button>
            <button
              onClick={handleLeaveRoom}
              className="px-6 py-3 glass-card text-white rounded-2xl hover:bg-white/30 transition-all duration-300"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}

      {/* Waiting for opponent */}
      {room.players.length === 1 && (
        <div className="glass-card-strong rounded-3xl p-6 text-center float-animation">
          <div className="animate-pulse">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Waiting for opponent...
            </h3>
            <p className="text-white/80 mb-4">
              Share the room ID <strong className="text-white">{roomId}</strong> with your friend
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
