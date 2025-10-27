import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Zap, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlayNow = () => {
    if (user) {
      navigate("/game");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 max-w-4xl"
      >
        <div className="animate-float">
          <AnimatedLogo />
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-foreground mt-8">
          Tic <span className="text-primary neon-glow-strong">Tac</span> Toe
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Challenge the AI or compete with friends in this futuristic twist on the classic game
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Button
            size="lg"
            onClick={handlePlayNow}
            className="text-lg px-8 py-6 neon-glow hover:neon-glow-strong transition-all duration-300"
          >
            <Zap className="mr-2 h-5 w-5" />
            Play Now
          </Button>
          
          {user ? (
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/dashboard")}
              className="text-lg px-8 py-6"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              <Users className="mr-2 h-5 w-5" />
              Login
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            { icon: Zap, title: "AI Opponent", desc: "Three difficulty levels to master" },
            { icon: Users, title: "Two Player", desc: "Challenge your friends locally" },
            { icon: Trophy, title: "Track Progress", desc: "View stats and game history" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-effect p-6 rounded-2xl"
            >
              <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
