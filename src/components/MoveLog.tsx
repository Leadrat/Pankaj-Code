import { ScrollArea } from "@/components/ui/scroll-area";

interface Move {
  player: string;
  row: number;
  col: number;
  moveIndex: number;
}

interface MoveLogProps {
  moves: Move[];
}

export const MoveLog = ({ moves }: MoveLogProps) => {
  return (
    <div className="glass-effect rounded-2xl p-4">
      <h3 className="text-xl font-bold mb-4">Move Log</h3>
      <ScrollArea className="h-48">
        {moves.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No moves yet</p>
        ) : (
          <div className="space-y-2">
            {moves.map((move, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/20"
              >
                <span className="font-semibold">{move.player}</span>
                <span className="text-muted-foreground">
                  ({move.row}, {move.col})
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
