import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, Sparkles } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  productName: string;
  casNumber: string;
  accreditation: string;
}

const accreditations = [
  { value: 'all', label: 'All Accreditations' },
  { value: 'fda', label: 'FDA Approved' },
  { value: 'who-gmp', label: 'WHO-GMP' },
  { value: 'eu-gmp', label: 'EU-GMP' },
  { value: 'iso-9001', label: 'ISO 9001' },
  { value: 'iso-14001', label: 'ISO 14001' },
  { value: 'cep', label: 'CEP' },
  { value: 'dmf', label: 'DMF' },
  { value: 'cdsco', label: 'CDSCO' },
];

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    productName: '',
    casNumber: '',
    accreditation: 'all',
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = () => {
    onSearch(filters);
    
    // Update active filter badges
    const newActiveFilters: string[] = [];
    if (filters.productName) newActiveFilters.push(`Product: ${filters.productName}`);
    if (filters.casNumber) newActiveFilters.push(`CAS: ${filters.casNumber}`);
    if (filters.accreditation && filters.accreditation !== 'all') {
      const acc = accreditations.find(a => a.value === filters.accreditation);
      if (acc) newActiveFilters.push(acc.label);
    }
    setActiveFilters(newActiveFilters);
  };

  const clearFilter = (filterToRemove: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filterToRemove));
    
    // Also update the actual filter state
    if (filterToRemove.startsWith('Product:')) {
      setFilters(prev => ({ ...prev, productName: '' }));
    } else if (filterToRemove.startsWith('CAS:')) {
      setFilters(prev => ({ ...prev, casNumber: '' }));
    } else {
      setFilters(prev => ({ ...prev, accreditation: 'all' }));
    }
  };

  const clearAllFilters = () => {
    setFilters({ productName: '', casNumber: '', accreditation: 'all' });
    setActiveFilters([]);
    onSearch({ productName: '', casNumber: '', accreditation: 'all' });
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Product Search</h3>
          <p className="text-sm text-muted-foreground">Find pharmaceutical products and request quotes</p>
        </div>
      </div>

      {/* Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Product name..."
            value={filters.productName}
            onChange={(e) => setFilters(prev => ({ ...prev, productName: e.target.value }))}
            className="pl-10 bg-background border-input focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="relative md:col-span-1">
          <Input
            placeholder="CAS Number (e.g., 50-78-2)"
            value={filters.casNumber}
            onChange={(e) => setFilters(prev => ({ ...prev, casNumber: e.target.value }))}
            className="font-mono bg-background border-input focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="md:col-span-1">
          <Select
            value={filters.accreditation}
            onValueChange={(value) => setFilters(prev => ({ ...prev, accreditation: value }))}
          >
            <SelectTrigger className="bg-background border-input focus:ring-2 focus:ring-primary/20">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Accreditation" />
            </SelectTrigger>
            <SelectContent>
              {accreditations.map((acc) => (
                <SelectItem key={acc.value} value={acc.value}>
                  {acc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1">
          <Button 
            onClick={handleSearch} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Products
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
            >
              {filter}
              <button
                onClick={() => clearFilter(filter)}
                className="ml-1 p-0.5 rounded-full hover:bg-primary/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground h-7"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

