import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Factory, Filter, X, Beaker, Award, MapPin, Sparkles } from 'lucide-react';
import {
  chemistries,
  accreditations,
  stateLocations,
  chemistryColors,
  accreditationColors,
  regionColors,
  calculateFilteredFacilities,
  type FilterState,
} from '@/lib/filterData';

interface FilterSummaryProps {
  filters: FilterState;
  onChemistryRemove: (id: string) => void;
  onAccreditationRemove: (id: string) => void;
  onLocationRemove: (id: string) => void;
  onClearAll: () => void;
}

export function FilterSummary({
  filters,
  onChemistryRemove,
  onAccreditationRemove,
  onLocationRemove,
  onClearAll,
}: FilterSummaryProps) {
  const hasFilters = 
    filters.chemistries.length > 0 || 
    filters.accreditations.length > 0 || 
    filters.locations.length > 0;

  if (!hasFilters) {
    return null;
  }

  const filteredFacilityCount = calculateFilteredFacilities(filters);
  const totalFilters = 
    filters.chemistries.length + 
    filters.accreditations.length + 
    filters.locations.length;

  // Get selected items
  const selectedChemistries = filters.chemistries
    .map(id => chemistries.find(c => c.id === id))
    .filter(Boolean);
  
  const selectedAccreditations = filters.accreditations
    .map(id => accreditations.find(a => a.id === id))
    .filter(Boolean);
  
  const selectedLocations = filters.locations
    .map(id => stateLocations.find(l => l.id === id))
    .filter(Boolean);

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Active Filters</h3>
              <p className="text-xs text-muted-foreground">
                {totalFilters} filter{totalFilters !== 1 ? 's' : ''} applied
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Results Count */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Factory className="w-4 h-4 text-primary" />
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold font-mono text-primary">{filteredFacilityCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground -mt-0.5">facilities match</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear all
            </Button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="space-y-3">
          {/* Chemistries */}
          {selectedChemistries.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[90px] sm:min-w-[100px] pt-0.5">
                <Beaker className="w-3.5 h-3.5" />
                <span>Chemistries</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedChemistries.map(chem => (
                  <Badge
                    key={chem!.id}
                    variant="secondary"
                    className={`pl-2 pr-1 py-0.5 gap-1 text-xs ${chemistryColors[chem!.category]}`}
                  >
                    {chem!.name}
                    <button
                      onClick={() => onChemistryRemove(chem!.id)}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Accreditations */}
          {selectedAccreditations.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[90px] sm:min-w-[100px] pt-0.5">
                <Award className="w-3.5 h-3.5" />
                <span>Accreditations</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAccreditations.map(acc => (
                  <Badge
                    key={acc!.id}
                    variant="secondary"
                    className={`pl-2 pr-1 py-0.5 gap-1 text-xs ${accreditationColors[acc!.category]}`}
                  >
                    {acc!.shortName}
                    <button
                      onClick={() => onAccreditationRemove(acc!.id)}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Locations */}
          {selectedLocations.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[90px] sm:min-w-[100px] pt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Locations</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedLocations.map(loc => (
                  <Badge
                    key={loc!.id}
                    variant="secondary"
                    className={`pl-2 pr-1 py-0.5 gap-1 text-xs ${regionColors[loc!.region]}`}
                  >
                    {loc!.name}
                    <button
                      onClick={() => onLocationRemove(loc!.id)}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>
            Filters work together to narrow down facilities. Click on map states or use the filter panels above.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

