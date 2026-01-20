import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { LocationStat } from "@/lib/api";

type LocationsTableProps = {
  locations: LocationStat[];
  loading?: boolean;
  level: string;
};

export function LocationsTable({ locations, loading, level }: LocationsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Locations by {level}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No locations found</p>
        ) : (
          <div className="space-y-2">
            {locations.map((loc, idx) => (
              <div
                key={loc.key}
                className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    #{idx + 1}
                  </Badge>
                  <span className="font-medium">{loc.key}</span>
                </div>
                <Badge>{loc.count} companies</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

