import { useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { TooltipProvider } from '@/components/ui/tooltip';

// Local India GeoJSON file
const INDIA_GEO_JSON = "/india-states.json";

interface StateData {
  name: string;
  facilities: number;
}

// Facility data by state (using various possible property names)
const facilitiesData: Record<string, number> = {
  // Standard names
  'Maharashtra': 312,
  'Gujarat': 234,
  'Karnataka': 198,
  'Telangana': 187,
  'Tamil Nadu': 165,
  'Uttar Pradesh': 156,
  'Andhra Pradesh': 145,
  'Madhya Pradesh': 112,
  'Delhi': 89,
  'NCT of Delhi': 89,
  'Rajasthan': 78,
  'Kerala': 76,
  'Haryana': 67,
  'West Bengal': 56,
  'Odisha': 48,
  'Orissa': 48,
  'Punjab': 45,
  'Jharkhand': 42,
  'Chhattisgarh': 38,
  'Uttarakhand': 35,
  'Uttaranchal': 35,
  'Bihar': 34,
  'Himachal Pradesh': 28,
  'Assam': 18,
  'Jammu and Kashmir': 12,
  'Jammu & Kashmir': 12,
  'Goa': 15,
  'Sikkim': 8,
  'Arunachal Pradesh': 6,
  'Meghalaya': 5,
  'Manipur': 4,
  'Mizoram': 3,
  'Nagaland': 4,
  'Tripura': 5,
  'Ladakh': 2,
  'Puducherry': 8,
  'Pondicherry': 8,
  'Chandigarh': 6,
  'Andaman and Nicobar Islands': 2,
  'Andaman & Nicobar': 2,
  'Andaman & Nicobar Island': 2,
  'Dadra and Nagar Haveli and Daman and Diu': 4,
  'Dadra & Nagar Haveli': 4,
  'Daman & Diu': 4,
  'Lakshadweep': 1,
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
  
  return 5; // Default for any unmatched state
};

const getColorByFacilities = (facilities: number): string => {
  if (facilities >= 200) return '#0d6e5f';
  if (facilities >= 100) return '#2a9d8f';
  if (facilities >= 50) return '#52b788';
  if (facilities >= 20) return '#95d5b2';
  return '#b7e4c7';
};

const IndiaMapComponent = () => {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const totalFacilities = 2213; // Pre-calculated total

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative w-full h-full min-h-[450px] flex items-center justify-center">
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
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e) => {
                      setHoveredState({ name: stateName, facilities });
                      const rect = (e.target as SVGElement).getBoundingClientRect();
                      setTooltipPosition({ x: rect.x + rect.width / 2, y: rect.y });
                    }}
                    onMouseLeave={() => setHoveredState(null)}
                    style={{
                      default: {
                        fill: getColorByFacilities(facilities),
                        stroke: '#ffffff',
                        strokeWidth: 0.5,
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      },
                      hover: {
                        fill: getColorByFacilities(facilities),
                        stroke: '#ffffff',
                        strokeWidth: 1,
                        outline: 'none',
                        filter: 'brightness(0.85)',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: getColorByFacilities(facilities),
                        stroke: '#ffffff',
                        strokeWidth: 1,
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
            className="fixed z-50 px-3 py-2 bg-card border border-border rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y - 60,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-semibold text-foreground text-sm">{hoveredState.name}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono text-primary font-semibold">{hoveredState.facilities}</span> facilities
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-sm">
          <p className="text-xs font-medium text-muted-foreground mb-2">Facilities</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: '#b7e4c7' }} />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
            <div className="w-3 h-3 rounded" style={{ background: '#95d5b2' }} />
            <div className="w-3 h-3 rounded" style={{ background: '#52b788' }} />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: '#0d6e5f' }} />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>

        {/* Total facilities badge */}
        <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-medium opacity-90">Total Facilities</p>
          <p className="text-2xl font-bold font-mono">{totalFacilities.toLocaleString()}</p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export const IndiaMap = memo(IndiaMapComponent);
