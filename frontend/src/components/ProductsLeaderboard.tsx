import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductStatByCompany, ProductStatGlobal } from "@/lib/api";

type ProductsLeaderboardProps = {
  companyStats: ProductStatByCompany[];
  globalStats: ProductStatGlobal[];
  loading?: boolean;
};

export function ProductsLeaderboard({
  companyStats,
  globalStats,
  loading,
}: ProductsLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="companies">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="companies">Top Companies</TabsTrigger>
            <TabsTrigger value="types">Product Types</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="mt-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : companyStats.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No companies found</p>
            ) : (
              <div className="space-y-2">
                {companyStats.map((company, idx) => (
                  <div
                    key={company.company_id}
                    className="flex items-center justify-between rounded-md border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        #{idx + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{company.company_name}</p>
                        <p className="text-xs text-muted-foreground">ID: {company.company_id}</p>
                      </div>
                    </div>
                    <Badge className="text-base">{company.product_count} products</Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="types" className="mt-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : globalStats.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No product types found
              </p>
            ) : (
              <div className="space-y-2">
                {globalStats.map((type) => (
                  <div
                    key={type.product_type}
                    className="flex items-center justify-between rounded-md border p-4 transition-colors hover:bg-accent"
                  >
                    <span className="font-medium">{type.product_type}</span>
                    <Badge variant="secondary" className="text-base">
                      {type.count} products
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

