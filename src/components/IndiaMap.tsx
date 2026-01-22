import { useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';
import { 
  stateLocations, 
  regionCategories, 
  regionColors,
  getLocationByName,
  TOTAL_FACILITIES 
} from '@/lib/filterData';

// Local India GeoJSON file
const INDIA_GEO_JSON = "/india-states.json";

interface StateData {
  name: string;
  facilities: number;
}

// Facility data by state (using various possible property names)
const facilitiesData: Record<string, number> = {
  // Standard names
  'Maharashtra': 16,
  'Gujarat': 12,
  'Karnataka': 10,
  'Telangana': 9,
  'Tamil Nadu': 8,
  'Uttar Pradesh': 8,
  'Andhra Pradesh': 7,
  'Madhya Pradesh': 5,
  'Delhi': 4,
  'NCT of Delhi': 4,
  'Rajasthan': 3,
  'Kerala': 4,
  'Haryana': 4,
  'West Bengal': 3,
  'Odisha': 3,
  'Orissa': 3,
  'Punjab': 2,
  'Jharkhand': 2,
  'Chhattisgarh': 2,
  'Uttarakhand': 2,
  'Uttaranchal': 2,
  'Bihar': 2,
  'Himachal Pradesh': 2,
  'Assam': 1,
  'Jammu and Kashmir': 1,
  'Jammu & Kashmir': 1,
  'Goa': 1,
  'Sikkim': 0,
  'Arunachal Pradesh': 0,
  'Meghalaya': 0,
  'Manipur': 0,
  'Mizoram': 0,
  'Nagaland': 0,
  'Tripura': 0,
  'Ladakh': 0,
  'Puducherry': 0,
  'Pondicherry': 0,
  'Chandigarh': 0,
  'Andaman and Nicobar Islands': 0,
  'Andaman & Nicobar': 0,
  'Andaman & Nicobar Island': 0,
  'Dadra and Nagar Haveli and Daman and Diu': 0,
  'Dadra & Nagar Haveli': 0,
  'Daman & Diu': 0,
  'Lakshadweep': 0,
};

const getStateName = (properties: Record<string, unknown>): string => {
  return (properties.ST_NM || properties.NAME_1 || properties.name || properties.NAME || properties.state || 'Unknown') as string;
};

const getFacilities = (stateName: string): number => {
  // Try exact match first
  if (facilitiesData[stateName]) return facilitiesData[stateName];
  
  // Try case-insensitive match
  const lowerName = stateName.toLowerCase();
  for (const [key, value] of Object.entries(facilitiesData)) {
    if (key.toLowerCase() === lowerName) return value;
  }
  
  return 0; // Default for any unmatched state
};

interface IndiaMapProps {
  selectedLocations?: string[];
  onLocationChange?: (locations: string[]) => void;
  interactive?: boolean;
}

const IndiaMapComponent = ({ 
  selectedLocations = [], 
  onLocationChange,
  interactive = false 
}: IndiaMapProps) => {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getColorByFacilities = (facilities: number, stateName: string): string => {
    const location = getLocationByName(stateName);
    const isSelected = location && selectedLocations.includes(location.id);
    
    if (isSelected) {
      return '#0d6e5f'; // Primary color when selected
    }
    
    if (facilities >= 10) return '#0d6e5f';
    if (facilities >= 5) return '#2a9d8f';
    if (facilities >= 3) return '#52b788';
    if (facilities >= 1) return '#95d5b2';
    return '#b7e4c7';
  };

  const handleStateClick = (stateName: string) => {
    if (!interactive || !onLocationChange) return;
    
    const location = getLocationByName(stateName);
    if (!location || location.facilityCount === 0) return;
    
    if (selectedLocations.includes(location.id)) {
      onLocationChange(selectedLocations.filter(id => id !== location.id));
    } else {
      onLocationChange([...selectedLocations, location.id]);
    }
  };

  const clearLocations = () => {
    if (onLocationChange) {
      onLocationChange([]);
    }
  };

  const selectedFacilityCount = selectedLocations.length > 0
    ? stateLocations
        .filter(l => selectedLocations.includes(l.id))
        .reduce((sum, l) => sum + l.facilityCount, 0)
    : TOTAL_FACILITIES;

  const selectedStateNames = selectedLocations
    .map(id => stateLocations.find(l => l.id === id)?.name)
    .filter(Boolean);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative w-full h-full min-h-[280px] sm:min-h-[350px] md:min-h-[450px] flex flex-col">
        {/* Selected Locations Header */}
        {interactive && selectedLocations.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-2 px-2">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Selected:</span>
            {selectedStateNames.slice(0, 3).map(name => {
              const location = stateLocations.find(l => l.name === name);
              return (
                <Badge
                  key={name}
                  variant="secondary"
                  className={`pl-2 pr-1 py-0.5 gap-1 text-xs ${location ? regionColors[location.region] : ''}`}
                >
                  {name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const loc = stateLocations.find(l => l.name === name);
                      if (loc && onLocationChange) {
                        onLocationChange(selectedLocations.filter(id => id !== loc.id));
                      }
                    }}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {selectedStateNames.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{selectedStateNames.length - 3} more
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLocations}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground ml-auto"
            >
              Clear
            </Button>
          </div>
        )}

        <div className="relative flex-1 flex items-center justify-center">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1000,
              center: [82.5, 22],
            }}
            style={{ width: '100%', height: '100%', maxHeight: '500px' }}
          >
            <Geographies geography={INDIA_GEO_JSON}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = getStateName(geo.properties);
                  const facilities = getFacilities(stateName);
                  const location = getLocationByName(stateName);
                  const isSelected = location && selectedLocations.includes(location.id);
                  const hasNoFacilities = facilities === 0;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleStateClick(stateName)}
                      onMouseEnter={(e) => {
                        setHoveredState({ name: stateName, facilities });
                        const rect = (e.target as SVGElement).getBoundingClientRect();
                        setTooltipPosition({ x: rect.x + rect.width / 2, y: rect.y });
                      }}
                      onMouseLeave={() => setHoveredState(null)}
                      style={{
                        default: {
                          fill: getColorByFacilities(facilities, stateName),
                          stroke: isSelected ? '#0d6e5f' : '#ffffff',
                          strokeWidth: isSelected ? 2 : 0.5,
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          opacity: hasNoFacilities && interactive ? 0.5 : 1,
                        },
                        hover: {
                          fill: getColorByFacilities(facilities, stateName),
                          stroke: interactive && !hasNoFacilities ? '#0d6e5f' : '#ffffff',
                          strokeWidth: interactive && !hasNoFacilities ? 2 : 1,
                          outline: 'none',
                          filter: interactive && !hasNoFacilities ? 'brightness(0.85)' : 'brightness(0.9)',
                          cursor: interactive && !hasNoFacilities ? 'pointer' : 'default',
                        },
                        pressed: {
                          fill: getColorByFacilities(facilities, stateName),
                          stroke: '#0d6e5f',
                          strokeWidth: 2,
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Hover Tooltip */}
          {hoveredState && (
            <div
              className="fixed z-50 px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg shadow-lg pointer-events-none"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y - 60,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="font-semibold text-foreground text-xs sm:text-sm">{hoveredState.name}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                <span className="font-mono text-primary font-semibold">{hoveredState.facilities}</span> facilities
              </p>
              {interactive && hoveredState.facilities > 0 && (
                <p className="text-[10px] text-primary mt-1">Click to {
                  getLocationByName(hoveredState.name) && selectedLocations.includes(getLocationByName(hoveredState.name)!.id) 
                    ? 'deselect' 
                    : 'select'
                }</p>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-card/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-border shadow-sm">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 sm:mb-2">Facilities</p>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ background: '#b7e4c7' }} />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Low</span>
              </div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ background: '#95d5b2' }} />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ background: '#52b788' }} />
              <div className="flex items-center gap-0.5 sm:gap-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ background: '#0d6e5f' }} />
                <span className="text-[10px] sm:text-xs text-muted-foreground">High</span>
              </div>
            </div>
            {interactive && (
              <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/50 pt-2">
                Click states to filter
              </p>
            )}
          </div>

          {/* Total/Selected facilities badge */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-primary text-primary-foreground rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-lg">
            <p className="text-[10px] sm:text-xs font-medium opacity-90">
              {selectedLocations.length > 0 ? 'Selected' : 'Total'} Facilities
            </p>
            <p className="text-lg sm:text-2xl font-bold font-mono">{selectedFacilityCount.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export const IndiaMap = memo(IndiaMapComponent);
