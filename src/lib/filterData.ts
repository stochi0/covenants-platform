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
export type StateRegion = 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
export interface StateLocation {
  id: string;
  name: string;
  facilityCount: number;
  region: StateRegion;
}

export type ChemistryCategory = Chemistry['category'];
export type AccreditationCategory = Accreditation['category'];

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
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
  central: 'Central',
  northeast: 'Northeast',
} as const;

// Color helpers for categories
export const chemistryColors: Record<Chemistry['category'], string> = {
  synthesis: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  fermentation: 'bg-green-500/10 text-green-700 border-green-200',
  extraction: 'bg-teal-500/10 text-teal-700 border-teal-200',
  biotechnology: 'bg-lime-500/10 text-lime-700 border-lime-200',
  specialty: 'bg-green-600/10 text-green-800 border-green-200',
};

export const accreditationColors: Record<Accreditation['category'], string> = {
  regulatory: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  quality: 'bg-green-500/10 text-green-700 border-green-200',
  environmental: 'bg-teal-500/10 text-teal-700 border-teal-200',
  international: 'bg-lime-500/10 text-lime-700 border-lime-200',
};

export const regionColors: Record<StateLocation['region'], string> = {
  north: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  south: 'bg-green-500/10 text-green-700 border-green-200',
  east: 'bg-teal-500/10 text-teal-700 border-teal-200',
  west: 'bg-lime-500/10 text-lime-700 border-lime-200',
  central: 'bg-green-600/10 text-green-800 border-green-200',
  northeast: 'bg-emerald-600/10 text-emerald-800 border-emerald-200',
};
