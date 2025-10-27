import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Target, TrendingUp, LogOut, Play } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0, total: 0 });
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      const { data: gamesData } = await supabase
        .from("games")
        .select("*")
        .eq("player_id", session.user.id)
        .order("created_at", { ascending: false });

      if (gamesData) {
        const wins = gamesData.filter((g) => g.result === "win").length;
        const losses = gamesData.filter((g) => g.result === "loss").length;
        const draws = gamesData.filter((g) => g.result === "draw").length;

        setStats({ wins, losses, draws, total: gamesData.length });
        setRecentGames(gamesData.slice(0, 10));
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getResultColor = (result: string) => {
    if (result === "win") return "text-primary";
    if (result === "loss") return "text-destructive";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/game")} className="neon-glow">
              <Play className="mr-2 h-4 w-4" />
              Play Game
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="glass-effect p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold">
              {profile?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile?.username}</h1>
              <p className="text-muted-foreground">Total Games: {stats.total}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-effect p-6 rounded-xl"
            >
              <Trophy className="h-10 w-10 text-primary mb-2" />
              <p className="text-3xl font-bold">{stats.wins}</p>
              <p className="text-muted-foreground">Wins</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-effect p-6 rounded-xl"
            >
              <Target className="h-10 w-10 text-destructive mb-2" />
              <p className="text-3xl font-bold">{stats.losses}</p>
              <p className="text-muted-foreground">Losses</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-effect p-6 rounded-xl"
            >
              <TrendingUp className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-3xl font-bold">{stats.draws}</p>
              <p className="text-muted-foreground">Draws</p>
            </motion.div>
          </div>
        </Card>

        <Card className="glass-effect p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Games</h2>
          {recentGames.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No games played yet. Start playing to see your history!
            </p>
          ) : (
            <div className="space-y-3">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="glass-effect p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {game.mode === "ai" ? `AI (${game.difficulty})` : "Two Player"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(game.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-xl font-bold ${getResultColor(game.result)}`}>
                    {game.result.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
