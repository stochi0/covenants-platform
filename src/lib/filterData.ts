// Unified filter types and data for the platform

export interface FilterState {
  chemistries: string[];
  accreditations: string[];
  locations: string[];
}

// Chemistry types
export interface Chemistry {
  id: string;
  name: string;
  facilityCount: number;
  category: 'synthesis' | 'fermentation' | 'extraction' | 'biotechnology' | 'specialty';
}

// Accreditation types
export interface Accreditation {
  id: string;
  name: string;
  shortName: string;
  facilityCount: number;
  category: 'regulatory' | 'quality' | 'environmental' | 'international';
}

// Location/State types
export interface StateLocation {
  id: string;
  name: string;
  facilityCount: number;
  region: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
}

// Chemistry categories
export const chemistryCategories = {
  synthesis: 'Synthesis',
  fermentation: 'Fermentation',
  extraction: 'Extraction & Purification',
  biotechnology: 'Biotechnology',
  specialty: 'Specialty Processes',
} as const;

// Accreditation categories
export const accreditationCategories = {
  regulatory: 'Regulatory',
  quality: 'Quality Management',
  environmental: 'Environmental',
  international: 'International',
} as const;

// Region categories
export const regionCategories = {
  north: 'North India',
  south: 'South India',
  east: 'East India',
  west: 'West India',
  central: 'Central India',
  northeast: 'Northeast India',
} as const;

export interface FilterDataForCalculation {
  chemistries: Chemistry[];
  accreditations: Accreditation[];
  stateLocations: StateLocation[];
  totalFacilities: number;
}

// Calculate filtered facility count (approximate based on filter overlap)
export function calculateFilteredFacilities(
  filters: FilterState,
  data: FilterDataForCalculation
): number {
  const { chemistries: chemIds, accreditations: accIds, locations: locIds } = filters;
  const { chemistries: chemList, accreditations: accList, stateLocations: locList, totalFacilities: total } = data;

  if (chemIds.length === 0 && accIds.length === 0 && locIds.length === 0) {
    return total;
  }

  let baseCount = total;

  if (locIds.length > 0) {
    baseCount = locList
      .filter((l) => locIds.includes(l.id))
      .reduce((sum, l) => sum + l.facilityCount, 0);
  }

  if (chemIds.length > 0 && chemIds.length < chemList.length) {
    const chemFactor = Math.min(1, chemIds.length / 5 + 0.3);
    baseCount = Math.ceil(baseCount * chemFactor);
  }

  if (accIds.length > 0 && accIds.length < accList.length) {
    const accFactor = Math.min(1, accIds.length / 3 + 0.4);
    baseCount = Math.ceil(baseCount * accFactor);
  }

  return Math.max(1, baseCount);
}

// Color helpers for categories
export const chemistryColors: Record<Chemistry['category'], string> = {
  synthesis: 'bg-blue-500/10 text-blue-700 border-blue-200',
  fermentation: 'bg-green-500/10 text-green-700 border-green-200',
  extraction: 'bg-amber-500/10 text-amber-700 border-amber-200',
  biotechnology: 'bg-purple-500/10 text-purple-700 border-purple-200',
  specialty: 'bg-rose-500/10 text-rose-700 border-rose-200',
};

export const accreditationColors: Record<Accreditation['category'], string> = {
  regulatory: 'bg-red-500/10 text-red-700 border-red-200',
  quality: 'bg-blue-500/10 text-blue-700 border-blue-200',
  environmental: 'bg-green-500/10 text-green-700 border-green-200',
  international: 'bg-purple-500/10 text-purple-700 border-purple-200',
};

export const regionColors: Record<StateLocation['region'], string> = {
  north: 'bg-sky-500/10 text-sky-700 border-sky-200',
  south: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  east: 'bg-amber-500/10 text-amber-700 border-amber-200',
  west: 'bg-violet-500/10 text-violet-700 border-violet-200',
  central: 'bg-orange-500/10 text-orange-700 border-orange-200',
  northeast: 'bg-teal-500/10 text-teal-700 border-teal-200',
};

