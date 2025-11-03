import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { ReplayViewer } from "./ReplayViewer";

export function MatchHistory() {
  const matches = useQuery(api.games.getMatchHistory);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  if (!matches) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="glass-card rounded-3xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (selectedMatch) {
    return (
      <ReplayViewer
        moveHistory={selectedMatch.moveHistory}
        players={selectedMatch.players}
        onClose={() => setSelectedMatch(null)}
      />
    );
  }

  if (matches.length === 0) {
    return (
      <div className="glass-card-strong rounded-3xl p-8 text-center float-animation">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-white mb-2">No Match History</h3>
        <p className="text-white/80">
          Your completed games will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-strong rounded-3xl overflow-hidden float-animation">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold">📊 Match History</h2>
        <p className="opacity-90">Your recent games</p>
      </div>

      <div className="divide-y divide-white/20">
        {matches.map((match) => {
          const currentPlayer = match.players.find(p => p.userId === loggedInUser?._id);
          const opponent = match.players.find(p => p.userId !== loggedInUser?._id);
          
          const result = 
            match.winner === "draw" ? "draw" :
            match.winner === loggedInUser?._id ? "win" : "loss";

          const resultColor = 
            result === "win" ? "text-green-300" :
            result === "loss" ? "text-red-300" : "text-yellow-300";

          const resultBg = 
            result === "win" ? "bg-green-500/20 border-green-400/30" :
            result === "loss" ? "bg-red-500/20 border-red-400/30" : "bg-yellow-500/20 border-yellow-400/30";

          return (
            <div key={match._id} className="p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${resultBg} ${resultColor}`}>
                      {result === "win" ? "Victory" : result === "loss" ? "Defeat" : "Draw"}
                    </span>
                    <span className="text-white/80">
                      vs {opponent?.username || "Unknown"}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <span>
                      You played as {currentPlayer?.symbol}
                    </span>
                    <span>•</span>
                    <span>
                      {match.moveHistory.length} moves
                    </span>
                    <span>•</span>
                    <span>
                      {Math.round(match.duration / 1000)}s duration
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(match.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMatch(match)}
                  className="px-4 py-2 gradient-button-purple rounded-2xl transition-all duration-300"
                >
                  Watch Replay
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
