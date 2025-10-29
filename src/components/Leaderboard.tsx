import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Leaderboard() {
  const leaderboard = useQuery(api.games.getLeaderboard);

  if (!leaderboard) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="glass-card rounded-3xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="glass-card-strong rounded-3xl p-8 text-center float-animation">
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
        <p className="text-white/80">
          Play at least 3 games to appear on the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-strong rounded-3xl overflow-hidden float-animation">
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          🏆 Leaderboard
        </h2>
        <p className="opacity-90">Top players by win rate (minimum 3 games)</p>
      </div>

      <div className="divide-y divide-white/20">
        {leaderboard.map((player, index) => (
          <div
            key={player.userId}
            className={`p-6 flex items-center justify-between transition-all duration-300 hover:bg-white/10 ${
              index === 0 ? "bg-yellow-500/20" : 
              index === 1 ? "bg-gray-400/20" : 
              index === 2 ? "bg-orange-500/20" : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white" :
                index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-500 text-white" :
                index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white" :
                "glass-card text-white"
              }`}>
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-white">{player.username}</h3>
                <p className="text-sm text-white/70">
                  {player.totalGames} games played
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {Math.round(player.winRate * 100)}%
              </div>
              <div className="text-sm text-white/70">
                {player.wins}W - {player.losses}L - {player.draws}D
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
