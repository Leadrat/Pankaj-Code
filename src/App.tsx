import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { GameLobby } from "./components/GameLobby";
import { GameRoom } from "./components/GameRoom";
import { Leaderboard } from "./components/Leaderboard";
import { MatchHistory } from "./components/MatchHistory";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-400 via-pink-500 via-purple-600 to-blue-600">
      <header className="sticky top-0 z-10 glass-card h-16 flex justify-between items-center px-4">
        <h2 className="text-2xl font-bold gradient-title sunburst">
          Realtime Multiplayer Game
        </h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [currentView, setCurrentView] = useState<"lobby" | "leaderboard" | "history">("lobby");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="glass-card rounded-3xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Unauthenticated>
        <div className="text-center py-16">
          <div className="sunburst mb-8">
            <h1 className="text-6xl font-bold gradient-title mb-6">
              Tic Attack Toe
            </h1>
          </div>
          <p className="text-xl text-white/90 mb-8 font-medium">
            Challenge friends to real-time matches with persistent scoreboards
          </p>
          <div className="max-w-md mx-auto">
            <div className="glass-card-strong rounded-3xl p-8 float-animation">
              <SignInForm />
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {currentRoomId ? (
          <GameRoom 
            roomId={currentRoomId} 
            onLeaveRoom={() => setCurrentRoomId(null)} 
          />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="sunburst mb-4">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, {loggedInUser?.name || loggedInUser?.email || "Player"}!
                </h1>
              </div>
              <p className="text-white/90 font-medium">Ready for your next match?</p>
            </div>

            {/* Navigation */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setCurrentView("lobby")}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  currentView === "lobby"
                    ? "gradient-button shadow-lg"
                    : "glass-card text-white hover:bg-white/30"
                }`}
              >
                Play Game
              </button>
              <button
                onClick={() => setCurrentView("leaderboard")}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  currentView === "leaderboard"
                    ? "gradient-button-purple shadow-lg"
                    : "glass-card text-white hover:bg-white/30"
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setCurrentView("history")}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  currentView === "history"
                    ? "gradient-button-purple shadow-lg"
                    : "glass-card text-white hover:bg-white/30"
                }`}
              >
                Match History
              </button>
            </div>

            {/* Content */}
            {currentView === "lobby" && (
              <GameLobby onJoinRoom={setCurrentRoomId} />
            )}
            {currentView === "leaderboard" && <Leaderboard />}
            {currentView === "history" && <MatchHistory />}
          </div>
        )}
      </Authenticated>
    </div>
  );
}
