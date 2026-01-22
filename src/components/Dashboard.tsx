import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCards } from './StatsCards';
import { IndiaMap } from './IndiaMap';
import { SearchFilters, type SearchFilters as FilterType } from './SearchFilters';
import { ProductResults } from './ProductResults';
import { FlaskConical, LayoutDashboard, Search, Building2, Globe, Menu, X } from 'lucide-react';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'manufacturers'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                  <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent animate-pulse-soft" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Capilia</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">Covenants Platform</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={
                  activeTab === 'overview'
                    ? "px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg transition-colors"
                    : "px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                }
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={
                  activeTab === 'search'
                    ? "px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg transition-colors"
                    : "px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                }
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manufacturers')}
                className={
                  activeTab === 'manufacturers'
                    ? "px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg transition-colors"
                    : "px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                }
              >
                Manufacturers
              </button>
              <button
                type="button"
                disabled
                className="px-4 py-2 text-sm font-medium text-muted-foreground/60 rounded-lg transition-colors cursor-not-allowed"
                title="Analytics coming soon"
              >
                Analytics
              </button>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Globe className="w-4 h-4" />
                <span>India</span>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('overview');
                  setMobileMenuOpen(false);
                }}
                className={
                  activeTab === 'overview'
                    ? "px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-lg transition-colors text-left flex items-center gap-3"
                    : "px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-left flex items-center gap-3"
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('search');
                  setMobileMenuOpen(false);
                }}
                className={
                  activeTab === 'search'
                    ? "px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-lg transition-colors text-left flex items-center gap-3"
                    : "px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-left flex items-center gap-3"
                }
              >
                <Search className="w-4 h-4" />
                Products
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('manufacturers');
                  setMobileMenuOpen(false);
                }}
                className={
                  activeTab === 'manufacturers'
                    ? "px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-lg transition-colors text-left flex items-center gap-3"
                    : "px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-left flex items-center gap-3"
                }
              >
                <Building2 className="w-4 h-4" />
                Manufacturers
              </button>
              <button
                type="button"
                disabled
                className="px-4 py-3 text-sm font-medium text-muted-foreground/60 rounded-lg transition-colors cursor-not-allowed text-left"
                title="Analytics coming soon"
              >
                Analytics (Coming Soon)
              </button>
              <div className="flex sm:hidden items-center gap-2 px-4 py-2 mt-2 border-t border-border pt-3">
                <Globe className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">Region: <span className="text-accent font-medium">India</span></span>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4 sm:space-y-8">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-thin">
            <TabsList className="bg-muted/50 p-1 rounded-xl inline-flex w-auto min-w-full sm:min-w-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg gap-1.5 sm:gap-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg gap-1.5 sm:gap-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Product</span> Search
              </TabsTrigger>
              <TabsTrigger
                value="manufacturers"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg gap-1.5 sm:gap-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Manufacturers
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-8 mt-0">
            {/* Welcome Section */}
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Platform Overview
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                Discover products, connect with manufacturers, and streamline your sourcing.
              </p>
            </div>

            {/* Stats Cards */}
            <StatsCards />

            {/* Map and Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* India Map */}
              <Card className="lg:col-span-3 border-border/50 overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Manufacturing Facilities by State
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                  <IndiaMap />
                </CardContent>
              </Card>

              {/* Quick Stats Sidebar */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Top States */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                    <CardTitle className="text-sm sm:text-base font-semibold">Our Manufacturing Presence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                    {[
                      { state: 'Maharashtra', facilities: 16, share: 13.2 },
                      { state: 'Gujarat', facilities: 12, share: 9.9 },
                      { state: 'Karnataka', facilities: 10, share: 8.3 },
                      { state: 'Telangana', facilities: 9, share: 7.4 },
                      { state: 'Tamil Nadu', facilities: 8, share: 6.6 },
                    ].map((item, index) => (
                      <div key={item.state} className="flex items-center gap-2 sm:gap-3">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs sm:text-sm font-medium truncate">{item.state}</span>
                            <span className="text-xs sm:text-sm font-mono text-muted-foreground">{item.facilities}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1 sm:h-1.5">
                            <div 
                              className="bg-primary rounded-full h-1 sm:h-1.5 transition-all duration-500"
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
                  <CardContent className="p-4 sm:p-5">
                    <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('search')}
                        className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background hover:bg-muted transition-colors border border-border/50 group"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium">Search Products</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Find APIs and intermediates</p>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('manufacturers')}
                        className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background hover:bg-muted transition-colors border border-border/50 group"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium">Browse Manufacturers</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">2,341 verified suppliers</p>
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
          <TabsContent value="search" className="space-y-4 sm:space-y-6 mt-0">
            {/* Search Section */}
            <Card className="border-border/50">
              <CardContent className="p-4 sm:p-6">
                <SearchFilters onSearch={handleSearch} />
              </CardContent>
            </Card>

            <Separator />

            {/* Results Section */}
            <ProductResults filters={searchFilters} />
          </TabsContent>

          {/* Manufacturers Tab */}
          <TabsContent value="manufacturers" className="space-y-4 sm:space-y-6 mt-0">
            <Card className="border-border/50">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Manufacturers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-6 pb-4 sm:pb-6">
                Manufacturers browsing is coming next. For now, use Product Search to discover suppliers by product.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-muted/30 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-semibold text-foreground text-sm sm:text-base">Covenants PharmaChem</span>
              <span className="text-muted-foreground text-xs sm:text-sm">© 2026</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-right">
              We take care of all your pharmaceutical and chemical needs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

