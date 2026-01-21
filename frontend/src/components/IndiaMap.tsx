import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StateData {
  id: string;
  name: string;
  facilities: number;
  path: string;
}

// Simplified India map paths for major states
const statesData: StateData[] = [
  { id: 'JK', name: 'Jammu & Kashmir', facilities: 12, path: 'M180,30 L220,35 L225,70 L200,85 L170,75 L165,50 Z' },
  { id: 'HP', name: 'Himachal Pradesh', facilities: 28, path: 'M200,85 L225,70 L245,85 L235,105 L210,110 L195,100 Z' },
  { id: 'PB', name: 'Punjab', facilities: 45, path: 'M170,95 L195,100 L210,110 L200,130 L175,125 L165,110 Z' },
  { id: 'HR', name: 'Haryana', facilities: 67, path: 'M175,125 L200,130 L210,150 L195,165 L175,155 L170,140 Z' },
  { id: 'UK', name: 'Uttarakhand', facilities: 35, path: 'M210,110 L235,105 L260,120 L250,145 L225,150 L210,135 Z' },
  { id: 'DL', name: 'Delhi', facilities: 89, path: 'M192,148 L202,148 L202,160 L192,160 Z' },
  { id: 'UP', name: 'Uttar Pradesh', facilities: 156, path: 'M210,150 L250,145 L295,160 L310,200 L280,230 L230,220 L200,190 L195,165 Z' },
  { id: 'RJ', name: 'Rajasthan', facilities: 78, path: 'M100,130 L170,140 L175,155 L195,165 L200,190 L180,230 L130,260 L85,220 L80,170 Z' },
  { id: 'GJ', name: 'Gujarat', facilities: 234, path: 'M45,210 L80,170 L85,220 L130,260 L120,300 L80,330 L35,310 L20,270 L30,230 Z' },
  { id: 'MP', name: 'Madhya Pradesh', facilities: 112, path: 'M130,260 L180,230 L230,220 L275,240 L290,290 L250,320 L180,310 L140,290 L120,300 Z' },
  { id: 'BR', name: 'Bihar', facilities: 34, path: 'M310,200 L350,195 L365,220 L345,240 L305,235 L295,215 Z' },
  { id: 'JH', name: 'Jharkhand', facilities: 42, path: 'M305,235 L345,240 L360,270 L330,290 L295,280 L280,255 Z' },
  { id: 'WB', name: 'West Bengal', facilities: 56, path: 'M345,240 L365,220 L385,230 L390,290 L370,330 L345,310 L330,290 L360,270 Z' },
  { id: 'OR', name: 'Odisha', facilities: 48, path: 'M280,290 L330,290 L345,310 L360,350 L320,380 L270,360 L260,320 L275,295 Z' },
  { id: 'CG', name: 'Chhattisgarh', facilities: 38, path: 'M275,290 L295,280 L330,290 L320,340 L280,355 L260,320 Z' },
  { id: 'MH', name: 'Maharashtra', facilities: 312, path: 'M80,330 L120,300 L140,290 L180,310 L250,320 L260,360 L240,410 L170,420 L100,390 L60,360 Z' },
  { id: 'TG', name: 'Telangana', facilities: 187, path: 'M180,360 L240,350 L270,380 L250,420 L200,430 L170,400 Z' },
  { id: 'AP', name: 'Andhra Pradesh', facilities: 145, path: 'M200,430 L250,420 L290,450 L310,500 L270,520 L220,510 L180,470 Z' },
  { id: 'KA', name: 'Karnataka', facilities: 198, path: 'M100,390 L170,420 L200,430 L180,470 L160,520 L100,530 L70,480 L75,420 Z' },
  { id: 'KL', name: 'Kerala', facilities: 76, path: 'M100,530 L130,530 L145,600 L120,630 L95,610 L90,560 Z' },
  { id: 'TN', name: 'Tamil Nadu', facilities: 165, path: 'M130,530 L160,520 L220,510 L240,550 L210,610 L160,620 L145,600 Z' },
  { id: 'AS', name: 'Assam', facilities: 18, path: 'M400,180 L450,175 L480,195 L470,220 L420,230 L395,210 Z' },
  { id: 'NE', name: 'North East', facilities: 24, path: 'M450,175 L495,165 L520,190 L510,230 L480,245 L470,220 L480,195 Z' },
  { id: 'SK', name: 'Sikkim', facilities: 8, path: 'M375,175 L395,170 L400,190 L385,200 L372,190 Z' },
  { id: 'AR', name: 'Arunachal Pradesh', facilities: 6, path: 'M470,140 L530,130 L545,160 L520,180 L480,170 L465,155 Z' },
];

const getColorIntensity = (facilities: number, max: number) => {
  const ratio = facilities / max;
  if (ratio > 0.7) return 'fill-primary';
  if (ratio > 0.4) return 'fill-primary/70';
  if (ratio > 0.2) return 'fill-primary/50';
  return 'fill-primary/30';
};

export function IndiaMap() {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const maxFacilities = Math.max(...statesData.map(s => s.facilities));

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
        <svg
          viewBox="0 0 550 680"
          className="w-full h-full max-w-[450px]"
          style={{ filter: 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.05))' }}
        >
          {/* Background glow */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="stateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.45 0.12 175)" />
              <stop offset="100%" stopColor="oklch(0.55 0.14 175)" />
            </linearGradient>
          </defs>

          {statesData.map((state) => (
            <Tooltip key={state.id}>
              <TooltipTrigger asChild>
                <path
                  d={state.path}
                  className={`state-path ${getColorIntensity(state.facilities, maxFacilities)} stroke-white/60`}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{
                    filter: hoveredState?.id === state.id ? 'url(#glow)' : undefined,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-card border-border shadow-lg"
              >
                <div className="text-center">
                  <p className="font-semibold text-foreground">{state.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono text-primary font-semibold">{state.facilities}</span> facilities
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Facilities</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/30" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/50" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/70" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>

        {/* Total facilities badge */}
        <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-medium opacity-90">Total Facilities</p>
          <p className="text-2xl font-bold font-mono">
            {statesData.reduce((sum, s) => sum + s.facilities, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}

