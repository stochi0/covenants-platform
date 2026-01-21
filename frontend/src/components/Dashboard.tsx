import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCards } from './StatsCards';
import { IndiaMap } from './IndiaMap';
import { SearchFilters, type SearchFilters as FilterType } from './SearchFilters';
import { ProductResults } from './ProductResults';
import { FlaskConical, LayoutDashboard, Search, Building2, Globe } from 'lucide-react';

export function Dashboard() {
  const [searchFilters, setSearchFilters] = useState<FilterType>({
    productName: '',
    casNumber: '',
    accreditation: 'all',
  });

  const handleSearch = (filters: FilterType) => {
    setSearchFilters(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-mesh-gradient pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse-soft" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Capilia</h1>
                <p className="text-xs text-muted-foreground">Covenants Platform</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <a 
                href="#" 
                className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg transition-colors"
              >
                Dashboard
              </a>
              <a 
                href="#" 
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Products
              </a>
              <a 
                href="#" 
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Manufacturers
              </a>
              <a 
                href="#" 
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Analytics
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Globe className="w-4 h-4" />
                <span>India</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg gap-2"
            >
              <Search className="w-4 h-4" />
              Product Search
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 mt-0">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                Platform Overview
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Real-time insights into India's pharmaceutical manufacturing ecosystem. 
                Discover products, connect with manufacturers, and streamline your sourcing.
              </p>
            </div>

            {/* Stats Cards */}
            <StatsCards />

            {/* Map and Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* India Map */}
              <Card className="lg:col-span-3 border-border/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                    Manufacturing Facilities by State
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <IndiaMap />
                </CardContent>
              </Card>

              {/* Quick Stats Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Top States */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Top Manufacturing States</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { state: 'Maharashtra', facilities: 16, share: 13.2 },
                      { state: 'Gujarat', facilities: 12, share: 9.9 },
                      { state: 'Karnataka', facilities: 10, share: 8.3 },
                      { state: 'Telangana', facilities: 9, share: 7.4 },
                      { state: 'Tamil Nadu', facilities: 8, share: 6.6 },
                    ].map((item, index) => (
                      <div key={item.state} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate">{item.state}</span>
                            <span className="text-sm font-mono text-muted-foreground">{item.facilities}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary rounded-full h-1.5 transition-all duration-500"
                              style={{ width: `${item.share * 5}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-4 py-3 rounded-lg bg-background hover:bg-muted transition-colors border border-border/50 group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Search className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Search Products</p>
                            <p className="text-xs text-muted-foreground">Find APIs and intermediates</p>
                          </div>
                        </div>
                      </button>
                      <button className="w-full text-left px-4 py-3 rounded-lg bg-background hover:bg-muted transition-colors border border-border/50 group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Browse Manufacturers</p>
                            <p className="text-xs text-muted-foreground">2,341 verified suppliers</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6 mt-0">
            {/* Search Section */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <SearchFilters onSearch={handleSearch} />
              </CardContent>
            </Card>

            <Separator />

            {/* Results Section */}
            <ProductResults filters={searchFilters} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Covenants</span>
              <span className="text-muted-foreground text-sm">© 2026</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Connecting pharmaceutical buyers with verified Indian manufacturers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

