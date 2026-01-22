import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Check, ChevronDown, ChevronUp, X, Factory } from 'lucide-react';
import { 
  stateLocations, 
  regionCategories, 
  regionColors,
  TOTAL_FACILITIES,
  type StateLocation 
} from '@/lib/filterData';

interface LocationFilterProps {
  selectedLocations: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function LocationFilter({ selectedLocations, onSelectionChange }: LocationFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeRegion, setActiveRegion] = useState<StateLocation['region'] | 'all'>('all');

  const toggleLocation = (locId: string) => {
    if (selectedLocations.includes(locId)) {
      onSelectionChange(selectedLocations.filter(id => id !== locId));
    } else {
      onSelectionChange([...selectedLocations, locId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectAllInRegion = (region: StateLocation['region']) => {
    const regionLocIds = stateLocations
      .filter(l => l.region === region)
      .map(l => l.id);
    const allSelected = regionLocIds.every(id => selectedLocations.includes(id));
    
    if (allSelected) {
      // Deselect all in this region
      onSelectionChange(selectedLocations.filter(id => !regionLocIds.includes(id)));
    } else {
      // Select all in this region
      const newSelection = [...new Set([...selectedLocations, ...regionLocIds])];
      onSelectionChange(newSelection);
    }
  };

  const filteredLocations = activeRegion === 'all' 
    ? stateLocations 
    : stateLocations.filter(l => l.region === activeRegion);

  const selectedFacilityCount = selectedLocations.length > 0
    ? stateLocations
        .filter(l => selectedLocations.includes(l.id))
        .reduce((sum, l) => sum + l.facilityCount, 0)
    : TOTAL_FACILITIES;

  const regions = ['all', 'west', 'south', 'north', 'central', 'east', 'northeast'] as const;

  // Sort locations by facility count (descending) within each view
  const sortedLocations = [...filteredLocations].sort((a, b) => b.facilityCount - a.facilityCount);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Locations
            <Badge variant="secondary" className="ml-1 text-xs font-mono">
              {selectedLocations.length > 0 ? selectedLocations.length : 23}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <span className="text-xs mr-1 hidden sm:inline">Collapse</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="text-xs mr-1 hidden sm:inline">Expand</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
        
        {/* Selected count summary */}
        <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-muted-foreground">
          <Factory className="w-3.5 h-3.5 text-accent" />
          <span>
            {selectedLocations.length > 0 ? (
              <>
                <span className="font-semibold text-foreground">{selectedLocations.length}</span> states • <span className="font-mono text-primary">{selectedFacilityCount}</span> facilities
              </>
            ) : (
              <>
                All <span className="font-semibold text-foreground">23</span> states • <span className="font-mono text-primary">{TOTAL_FACILITIES}</span> facilities
              </>
            )}
          </span>
          {selectedLocations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground ml-auto"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Selected Locations Pills */}
        {selectedLocations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedLocations.slice(0, isExpanded ? undefined : 5).map(locId => {
              const loc = stateLocations.find(l => l.id === locId);
              if (!loc) return null;
              return (
                <Badge
                  key={loc.id}
                  variant="secondary"
                  className={`pl-2 pr-1 py-0.5 gap-1 cursor-pointer hover:opacity-80 transition-opacity text-xs ${regionColors[loc.region]}`}
                >
                  {loc.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLocation(loc.id);
                    }}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {!isExpanded && selectedLocations.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{selectedLocations.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Region Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
              {regions.map(region => {
                const count = region === 'all' 
                  ? stateLocations.length 
                  : stateLocations.filter(l => l.region === region).length;
                
                return (
                  <button
                    key={region}
                    onClick={() => setActiveRegion(region)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                      ${activeRegion === region 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    {region === 'all' ? 'All Regions' : regionCategories[region]}
                    <span className="ml-1.5 font-mono opacity-70">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Region Summary when not "All" */}
            {activeRegion !== 'all' && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${regionColors[activeRegion]}`}>
                    {regionCategories[activeRegion]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono text-foreground font-medium">
                      {stateLocations.filter(l => l.region === activeRegion).reduce((sum, l) => sum + l.facilityCount, 0)}
                    </span> facilities
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectAllInRegion(activeRegion)}
                  className="text-xs h-7"
                >
                  {stateLocations.filter(l => l.region === activeRegion).every(l => selectedLocations.includes(l.id))
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>
            )}

            {/* Location Grid */}
            <ScrollArea className="h-[280px] sm:h-[320px] pr-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sortedLocations.map(loc => {
                  const isSelected = selectedLocations.includes(loc.id);
                  return (
                    <button
                      key={loc.id}
                      onClick={() => toggleLocation(loc.id)}
                      className={`
                        flex items-center gap-2 p-2.5 sm:p-3 rounded-lg border text-left transition-all group
                        ${isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border/50 bg-background hover:border-primary/30 hover:bg-muted/30'
                        }
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted group-hover:bg-primary/20'
                        }
                      `}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs sm:text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {loc.name}
                          </p>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="font-mono">{loc.facilityCount}</span> facilities
                          <span className="text-muted-foreground/50">•</span>
                          <Badge 
                            variant="outline" 
                            className={`text-[9px] px-1.5 py-0 h-4 ${regionColors[loc.region]}`}
                          >
                            {regionCategories[loc.region].replace(' India', '')}
                          </Badge>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Collapsed Preview - Show top states by facility count */}
        {!isExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {stateLocations
              .sort((a, b) => b.facilityCount - a.facilityCount)
              .slice(0, 8)
              .map(loc => {
                const isSelected = selectedLocations.includes(loc.id);
                return (
                  <button
                    key={loc.id}
                    onClick={() => toggleLocation(loc.id)}
                    className={`
                      flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all text-xs
                      ${isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border/50 bg-background hover:border-primary/30 hover:bg-muted/30'
                      }
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors
                      ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                    `}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`truncate block ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                        {loc.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{loc.facilityCount}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
        
        {!isExpanded && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Click expand to see all 23 states by region
          </p>
        )}
      </CardContent>
    </Card>
  );
}

