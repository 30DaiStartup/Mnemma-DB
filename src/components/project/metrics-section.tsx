import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MetricData } from "@/types";

interface MetricsSectionProps {
  metrics: MetricData[];
}

const TREND_CONFIG: Record<
  string,
  { icon: typeof TrendingUp; className: string }
> = {
  up: { icon: TrendingUp, className: "text-emerald-500" },
  down: { icon: TrendingDown, className: "text-red-500" },
  stable: { icon: Minus, className: "text-muted-foreground" },
};

export function MetricsSection({ metrics }: MetricsSectionProps) {
  if (metrics.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No metrics tracked yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const trendCfg = TREND_CONFIG[metric.trend] ?? TREND_CONFIG.stable;
        const TrendIcon = trendCfg.icon;

        return (
          <Card key={metric.id} size="sm">
            <CardContent className="pt-0">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {metric.name}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums">
                    {metric.value}
                  </span>
                  {metric.unit && (
                    <span className="text-sm text-muted-foreground">
                      {metric.unit}
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-1 ${trendCfg.className}`}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium capitalize">
                    {metric.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
