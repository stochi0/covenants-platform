import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { ChemistryStat } from "@/lib/api";

type ChemistryChartProps = {
  chemistries: ChemistryStat[];
  loading?: boolean;
};

export function ChemistryChart({ chemistries, loading }: ChemistryChartProps) {
  const maxCount = Math.max(...chemistries.map((c) => c.company_count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chemistries Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : chemistries.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No chemistries found</p>
        ) : (
          <div className="space-y-3">
            {chemistries.map((chem) => {
              const percentage = (chem.company_count / maxCount) * 100;
              return (
                <div key={chem.chemistry} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{chem.chemistry}</span>
                    <Badge variant="secondary">{chem.company_count} companies</Badge>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

