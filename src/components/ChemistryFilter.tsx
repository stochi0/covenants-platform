import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Beaker, Check, ChevronDown, ChevronUp, X, Factory } from 'lucide-react';
import { 
  chemistries, 
  chemistryCategories, 
  chemistryColors,
  TOTAL_FACILITIES,
  type Chemistry 
} from '@/lib/filterData';

interface ChemistryFilterProps {
  selectedChemistries: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function ChemistryFilter({ selectedChemistries, onSelectionChange }: ChemistryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Chemistry['category'] | 'all'>('all');

  const toggleChemistry = (chemId: string) => {
    if (selectedChemistries.includes(chemId)) {
      onSelectionChange(selectedChemistries.filter(id => id !== chemId));
    } else {
      onSelectionChange([...selectedChemistries, chemId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectAllInCategory = (category: Chemistry['category']) => {
    const categoryChemIds = chemistries
      .filter(c => c.category === category)
      .map(c => c.id);
    const newSelection = [...new Set([...selectedChemistries, ...categoryChemIds])];
    onSelectionChange(newSelection);
  };

  const filteredChemistries = activeCategory === 'all' 
    ? chemistries 
    : chemistries.filter(c => c.category === activeCategory);

  // Total facilities = 121 (unique), but when filtered we show max facilities with selected chemistries
  const selectedFacilityCount = selectedChemistries.length > 0
    ? Math.min(
        chemistries
          .filter(c => selectedChemistries.includes(c.id))
          .reduce((max, c) => Math.max(max, c.facilityCount), 0) +
        Math.floor(selectedChemistries.length * 2.5), // Approximate overlap calculation
        TOTAL_FACILITIES
      )
    : TOTAL_FACILITIES;

  const categories = ['all', 'synthesis', 'fermentation', 'extraction', 'biotechnology', 'specialty'] as const;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
            <Beaker className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Chemistries
            <Badge variant="secondary" className="ml-1 text-xs font-mono">
              {selectedChemistries.length > 0 ? selectedChemistries.length : 25}
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
            {selectedChemistries.length > 0 ? (
              <>
                <span className="font-semibold text-foreground">{selectedChemistries.length}</span> selected • <span className="font-mono text-primary">{selectedFacilityCount}</span> facilities
              </>
            ) : (
              <>
                All <span className="font-semibold text-foreground">25</span> chemistries • <span className="font-mono text-primary">{TOTAL_FACILITIES}</span> facilities
              </>
            )}
          </span>
          {selectedChemistries.length > 0 && (
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
        {/* Selected Chemistries Pills */}
        {selectedChemistries.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedChemistries.slice(0, isExpanded ? undefined : 5).map(chemId => {
              const chem = chemistries.find(c => c.id === chemId);
              if (!chem) return null;
              return (
                <Badge
                  key={chem.id}
                  variant="secondary"
                  className={`pl-2 pr-1 py-0.5 gap-1 cursor-pointer hover:opacity-80 transition-opacity text-xs ${chemistryColors[chem.category]}`}
                >
                  {chem.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChemistry(chem.id);
                    }}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {!isExpanded && selectedChemistries.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{selectedChemistries.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Category Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                    ${activeCategory === cat 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  {cat === 'all' ? 'All' : chemistryCategories[cat]}
                  <span className="ml-1.5 font-mono opacity-70">
                    {cat === 'all' ? 25 : chemistries.filter(c => c.category === cat).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Chemistry Grid */}
            <ScrollArea className="h-[280px] sm:h-[320px] pr-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredChemistries.map(chem => {
                  const isSelected = selectedChemistries.includes(chem.id);
                  return (
                    <button
                      key={chem.id}
                      onClick={() => toggleChemistry(chem.id)}
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
                        <p className={`text-xs sm:text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {chem.name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          <span className="font-mono">{chem.facilityCount}</span> facilities
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] hidden sm:flex ${chemistryColors[chem.category]}`}
                      >
                        {chemistryCategories[chem.category].split(' ')[0]}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {activeCategory !== 'all' && (
              <div className="flex justify-end pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectAllInCategory(activeCategory)}
                  className="text-xs h-7"
                >
                  Select all in {chemistryCategories[activeCategory]}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Collapsed Preview */}
        {!isExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {chemistries.slice(0, 8).map(chem => {
              const isSelected = selectedChemistries.includes(chem.id);
              return (
                <button
                  key={chem.id}
                  onClick={() => toggleChemistry(chem.id)}
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
                  <span className={`truncate ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {chem.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        
        {!isExpanded && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Click expand to see all 25 chemistries
          </p>
        )}
      </CardContent>
    </Card>
  );
}

