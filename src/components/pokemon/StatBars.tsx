import { PokemonStat } from "@/lib/types";

const STAT_LABEL: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "Sp. ATK",
  "special-defense": "Sp. DEF",
  speed: "SPD",
};

export function StatBars({ stats }: { stats: PokemonStat[] }) {
  const max = 200; // simple scaling cap for UI

  return (
    <div className="space-y-3">
      {stats.map((s) => {
        const name = s.stat.name;
        const label = STAT_LABEL[name] ?? name;
        const value = s.base_stat;
        const pct = Math.min(100, Math.round((value / max) * 100));

        return (
          <div key={name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-foreground"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}