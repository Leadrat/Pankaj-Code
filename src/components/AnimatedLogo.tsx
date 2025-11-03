import { motion } from "framer-motion";

export const AnimatedLogo = () => {
  const cellVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
  };

  return (
    // supabase implemented
    <div className="flex items-center justify-center gap-1">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex flex-col gap-1">
          {[0, 1, 2].map((col) => {
            const delay = (row + col) * 0.1;
            const symbol = (row + col) % 2 === 0 ? "X" : "O";
            
            return (
              <motion.div
                key={`${row}-${col}`}
                variants={cellVariants}
                initial="initial"
                animate="animate"
                transition={{
                  delay,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center text-2xl font-bold text-primary neon-glow"
              >
                {symbol}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
