import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Award, Check, ChevronDown, ChevronUp, X, ShieldCheck } from 'lucide-react';
import { 
  accreditations, 
  accreditationCategories, 
  accreditationColors,
  type Accreditation 
} from '@/lib/filterData';

interface AccreditationFilterProps {
  selectedAccreditations: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function AccreditationFilter({ selectedAccreditations, onSelectionChange }: AccreditationFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Accreditation['category'] | 'all'>('all');

  const toggleAccreditation = (accId: string) => {
    if (selectedAccreditations.includes(accId)) {
      onSelectionChange(selectedAccreditations.filter(id => id !== accId));
    } else {
      onSelectionChange([...selectedAccreditations, accId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectAllInCategory = (category: Accreditation['category']) => {
    const categoryAccIds = accreditations
      .filter(a => a.category === category)
      .map(a => a.id);
    const newSelection = [...new Set([...selectedAccreditations, ...categoryAccIds])];
    onSelectionChange(newSelection);
  };

  const filteredAccreditations = activeCategory === 'all' 
    ? accreditations 
    : accreditations.filter(a => a.category === activeCategory);

  const totalFacilities = 121;
  const selectedFacilityCount = selectedAccreditations.length > 0
    ? Math.min(
        accreditations
          .filter(a => selectedAccreditations.includes(a.id))
          .reduce((max, a) => Math.max(max, a.facilityCount), 0) +
        Math.floor(selectedAccreditations.length * 3),
        totalFacilities
      )
    : totalFacilities;

  const categories = ['all', 'regulatory', 'quality', 'environmental', 'international'] as const;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Accreditations
            <Badge variant="secondary" className="ml-1 text-xs font-mono">
              {selectedAccreditations.length > 0 ? selectedAccreditations.length : 15}
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
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>
            {selectedAccreditations.length > 0 ? (
              <>
                <span className="font-semibold text-foreground">{selectedAccreditations.length}</span> selected • <span className="font-mono text-primary">{selectedFacilityCount}</span> facilities
              </>
            ) : (
              <>
                All <span className="font-semibold text-foreground">15</span> accreditations • <span className="font-mono text-primary">{totalFacilities}</span> facilities
              </>
            )}
          </span>
          {selectedAccreditations.length > 0 && (
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
        {/* Selected Accreditations Pills */}
        {selectedAccreditations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedAccreditations.slice(0, isExpanded ? undefined : 5).map(accId => {
              const acc = accreditations.find(a => a.id === accId);
              if (!acc) return null;
              return (
                <Badge
                  key={acc.id}
                  variant="secondary"
                  className={`pl-2 pr-1 py-0.5 gap-1 cursor-pointer hover:opacity-80 transition-opacity text-xs ${accreditationColors[acc.category]}`}
                >
                  {acc.shortName}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAccreditation(acc.id);
                    }}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {!isExpanded && selectedAccreditations.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{selectedAccreditations.length - 5} more
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
                  {cat === 'all' ? 'All' : accreditationCategories[cat]}
                  <span className="ml-1.5 font-mono opacity-70">
                    {cat === 'all' ? 15 : accreditations.filter(a => a.category === cat).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Accreditation Grid */}
            <ScrollArea className="h-[240px] sm:h-[280px] pr-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredAccreditations.map(acc => {
                  const isSelected = selectedAccreditations.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      onClick={() => toggleAccreditation(acc.id)}
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
                            {acc.shortName}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] hidden sm:flex ${accreditationColors[acc.category]}`}
                          >
                            {accreditationCategories[acc.category].split(' ')[0]}
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {acc.name} • <span className="font-mono">{acc.facilityCount}</span> facilities
                        </p>
                      </div>
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
                  Select all {accreditationCategories[activeCategory]}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Collapsed Preview */}
        {!isExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {accreditations.slice(0, 8).map(acc => {
              const isSelected = selectedAccreditations.includes(acc.id);
              return (
                <button
                  key={acc.id}
                  onClick={() => toggleAccreditation(acc.id)}
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
                    {acc.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        
        {!isExpanded && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Click expand to see all 15 accreditations
          </p>
        )}
      </CardContent>
    </Card>
  );
}

