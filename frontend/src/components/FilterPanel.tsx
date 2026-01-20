import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type Filters = {
  country: string;
  state: string;
  city: string;
  chemistries: string[];
};

type FilterPanelProps = {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
};

const COMMON_CHEMISTRIES = [
  "HYDROGENATION",
  "OXIDATION",
  "NITRATION",
  "SULFONATION",
  "HALOGENATION",
  "ALKYLATION",
  "ACYLATION",
  "ESTERIFICATION",
];

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const updateFilter = (key: keyof Filters, value: string | string[]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleChemistry = (chemistry: string) => {
    const current = filters.chemistries;
    const updated = current.includes(chemistry)
      ? current.filter((c) => c !== chemistry)
      : [...current, chemistry];
    updateFilter("chemistries", updated);
  };

  const clearFilters = () => {
    onFiltersChange({
      country: "",
      state: "",
      city: "",
      chemistries: [],
    });
  };

  const hasActiveFilters =
    filters.country || filters.state || filters.city || filters.chemistries.length > 0;

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Location Filters */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Country</label>
          <Input
            placeholder="e.g., India"
            value={filters.country}
            onChange={(e) => updateFilter("country", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">State</label>
          <Input
            placeholder="e.g., Karnataka"
            value={filters.state}
            onChange={(e) => updateFilter("state", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">City</label>
          <Input
            placeholder="e.g., Bangalore"
            value={filters.city}
            onChange={(e) => updateFilter("city", e.target.value)}
          />
        </div>
      </div>

      {/* Chemistry Filters */}
      <div>
        <label className="mb-3 block text-sm font-medium">
          Chemistries
          {filters.chemistries.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({filters.chemistries.length} selected)
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_CHEMISTRIES.map((chem) => (
            <Badge
              key={chem}
              variant={filters.chemistries.includes(chem) ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleChemistry(chem)}
            >
              {chem}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

