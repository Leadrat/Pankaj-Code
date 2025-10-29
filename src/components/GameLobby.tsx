import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface GameLobbyProps {
  onJoinRoom: (roomId: string) => void;
}

export function GameLobby({ onJoinRoom }: GameLobbyProps) {
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const createRoom = useMutation(api.games.createRoom);
  const joinRoom = useMutation(api.games.joinRoom);
  const userStats = useQuery(api.games.getUserStats);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const result = await createRoom();
      onJoinRoom(result.roomId);
      toast.success("Room created! Share the room ID with your friend.");
    } catch (error) {
      toast.error("Failed to create room");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    setIsJoining(true);
    try {
      await joinRoom({ roomId: joinRoomId.trim().toUpperCase() });
      onJoinRoom(joinRoomId.trim().toUpperCase());
      toast.success("Joined room successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* User Stats Card */}
      {userStats && (
        <div className="glass-card-strong rounded-3xl p-6 float-animation">
          <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center glass-card rounded-2xl p-4">
              <div className="text-2xl font-bold text-green-300">{userStats.wins}</div>
              <div className="text-sm text-white/80">Wins</div>
            </div>
            <div className="text-center glass-card rounded-2xl p-4">
              <div className="text-2xl font-bold text-red-300">{userStats.losses}</div>
              <div className="text-sm text-white/80">Losses</div>
            </div>
            <div className="text-center glass-card rounded-2xl p-4">
              <div className="text-2xl font-bold text-yellow-300">{userStats.draws}</div>
              <div className="text-sm text-white/80">Draws</div>
            </div>
            <div className="text-center glass-card rounded-2xl p-4">
              <div className="text-2xl font-bold text-blue-300">
                {Math.round(userStats.winRate * 100)}%
              </div>
              <div className="text-sm text-white/80">Win Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Room */}
        <div className="glass-card-strong rounded-3xl p-6 float-animation">
          <h3 className="text-xl font-bold text-white mb-4">Create New Game</h3>
          <p className="text-white/80 mb-6">
            Start a new game and invite a friend to join
          </p>
          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full gradient-button py-3 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              "Create Room"
            )}
          </button>
        </div>

        {/* Join Room */}
        <div className="glass-card-strong rounded-3xl p-6 float-animation">
          <h3 className="text-xl font-bold text-white mb-4">Join Existing Game</h3>
          <p className="text-white/80 mb-4">
            Enter the room ID shared by your friend
          </p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter Room ID (e.g., ABC123)"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-2xl backdrop-blur-lg bg-white/20 border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 outline-none text-white placeholder-white/60"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              disabled={isJoining || !joinRoomId.trim()}
              className="w-full gradient-button-purple py-3 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Joining...
                </div>
              ) : (
                "Join Room"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* How to Play */}
      <div className="glass-card-strong rounded-3xl p-6 float-animation">
        <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-white/80">
          <div className="text-center">
            <div className="w-12 h-12 glass-card rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-orange-300 font-bold">1</span>
            </div>
            <p>Create a room or join with a room ID</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 glass-card rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-pink-300 font-bold">2</span>
            </div>
            <p>Both players mark ready to start</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 glass-card rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-300 font-bold">3</span>
            </div>
            <p>Take turns placing X's and O's</p>
          </div>
        </div>
      </div>
    </div>
  );
}
