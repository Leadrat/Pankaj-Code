import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

interface ReplayControlsProps {
  currentMove: number;
  totalMoves: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onMoveChange: (move: number) => void;
  onStepBack: () => void;
  onStepForward: () => void;
}

export const ReplayControls = ({
  currentMove,
  totalMoves,
  isPlaying,
  onPlayPause,
  onReset,
  onMoveChange,
  onStepBack,
  onStepForward,
}: ReplayControlsProps) => {
  return (
    <div className="glass-effect rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-bold mb-4">Replay Controls</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Move {currentMove}</span>
          <span>of {totalMoves}</span>
        </div>
        <Slider
          value={[currentMove]}
          max={totalMoves}
          step={1}
          onValueChange={([value]) => onMoveChange(value)}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button size="icon" variant="secondary" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={onStepBack} disabled={currentMove === 0}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button size="icon" onClick={onPlayPause} className="neon-glow">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="secondary" onClick={onStepForward} disabled={currentMove === totalMoves}>
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
