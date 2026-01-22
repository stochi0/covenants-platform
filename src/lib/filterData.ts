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

// 25 pharmaceutical chemistries
export const chemistries: Chemistry[] = [
  // Synthesis
  { id: 'chem-1', name: 'Asymmetric Synthesis', facilityCount: 34, category: 'synthesis' },
  { id: 'chem-2', name: 'Peptide Synthesis', facilityCount: 28, category: 'synthesis' },
  { id: 'chem-3', name: 'Heterocyclic Chemistry', facilityCount: 52, category: 'synthesis' },
  { id: 'chem-4', name: 'Organometallic Chemistry', facilityCount: 19, category: 'synthesis' },
  { id: 'chem-5', name: 'Flow Chemistry', facilityCount: 15, category: 'synthesis' },
  { id: 'chem-6', name: 'Photochemistry', facilityCount: 8, category: 'synthesis' },
  { id: 'chem-7', name: 'Green Chemistry', facilityCount: 41, category: 'synthesis' },
  
  // Fermentation
  { id: 'chem-8', name: 'Microbial Fermentation', facilityCount: 38, category: 'fermentation' },
  { id: 'chem-9', name: 'Enzymatic Processes', facilityCount: 29, category: 'fermentation' },
  { id: 'chem-10', name: 'Biocatalysis', facilityCount: 22, category: 'fermentation' },
  { id: 'chem-11', name: 'Solid State Fermentation', facilityCount: 14, category: 'fermentation' },
  
  // Extraction & Purification
  { id: 'chem-12', name: 'Solvent Extraction', facilityCount: 67, category: 'extraction' },
  { id: 'chem-13', name: 'Supercritical CO2 Extraction', facilityCount: 11, category: 'extraction' },
  { id: 'chem-14', name: 'Chromatographic Purification', facilityCount: 45, category: 'extraction' },
  { id: 'chem-15', name: 'Crystallization', facilityCount: 58, category: 'extraction' },
  { id: 'chem-16', name: 'Distillation', facilityCount: 49, category: 'extraction' },
  
  // Biotechnology
  { id: 'chem-17', name: 'Recombinant DNA Technology', facilityCount: 12, category: 'biotechnology' },
  { id: 'chem-18', name: 'Cell Culture', facilityCount: 18, category: 'biotechnology' },
  { id: 'chem-19', name: 'Monoclonal Antibodies', facilityCount: 7, category: 'biotechnology' },
  { id: 'chem-20', name: 'Gene Therapy Vectors', facilityCount: 4, category: 'biotechnology' },
  
  // Specialty Processes
  { id: 'chem-21', name: 'Chiral Resolution', facilityCount: 26, category: 'specialty' },
  { id: 'chem-22', name: 'Polymorph Screening', facilityCount: 31, category: 'specialty' },
  { id: 'chem-23', name: 'Salt Formation', facilityCount: 44, category: 'specialty' },
  { id: 'chem-24', name: 'Continuous Manufacturing', facilityCount: 16, category: 'specialty' },
  { id: 'chem-25', name: 'Nano-formulation', facilityCount: 9, category: 'specialty' },
];

// Accreditations
export const accreditations: Accreditation[] = [
  // Regulatory
  { id: 'acc-1', name: 'FDA Approved', shortName: 'FDA', facilityCount: 45, category: 'regulatory' },
  { id: 'acc-2', name: 'CDSCO Approved', shortName: 'CDSCO', facilityCount: 98, category: 'regulatory' },
  { id: 'acc-3', name: 'Drug Master File', shortName: 'DMF', facilityCount: 67, category: 'regulatory' },
  { id: 'acc-4', name: 'Certificate of Suitability', shortName: 'CEP', facilityCount: 38, category: 'regulatory' },
  
  // Quality Management
  { id: 'acc-5', name: 'WHO-GMP Certified', shortName: 'WHO-GMP', facilityCount: 72, category: 'quality' },
  { id: 'acc-6', name: 'EU-GMP Certified', shortName: 'EU-GMP', facilityCount: 41, category: 'quality' },
  { id: 'acc-7', name: 'ISO 9001:2015', shortName: 'ISO 9001', facilityCount: 89, category: 'quality' },
  { id: 'acc-8', name: 'ICH Q7 Compliant', shortName: 'ICH Q7', facilityCount: 56, category: 'quality' },
  
  // Environmental
  { id: 'acc-9', name: 'ISO 14001:2015', shortName: 'ISO 14001', facilityCount: 63, category: 'environmental' },
  { id: 'acc-10', name: 'ISO 45001:2018', shortName: 'ISO 45001', facilityCount: 48, category: 'environmental' },
  { id: 'acc-11', name: 'EcoVadis Certified', shortName: 'EcoVadis', facilityCount: 24, category: 'environmental' },
  
  // International
  { id: 'acc-12', name: 'TGA Approved', shortName: 'TGA', facilityCount: 29, category: 'international' },
  { id: 'acc-13', name: 'Health Canada', shortName: 'HC', facilityCount: 22, category: 'international' },
  { id: 'acc-14', name: 'PMDA Japan', shortName: 'PMDA', facilityCount: 18, category: 'international' },
  { id: 'acc-15', name: 'ANVISA Brazil', shortName: 'ANVISA', facilityCount: 15, category: 'international' },
];

// States/Locations with facilities
export const stateLocations: StateLocation[] = [
  // West India
  { id: 'loc-1', name: 'Maharashtra', facilityCount: 16, region: 'west' },
  { id: 'loc-2', name: 'Gujarat', facilityCount: 12, region: 'west' },
  { id: 'loc-3', name: 'Goa', facilityCount: 1, region: 'west' },
  
  // South India
  { id: 'loc-4', name: 'Karnataka', facilityCount: 10, region: 'south' },
  { id: 'loc-5', name: 'Telangana', facilityCount: 9, region: 'south' },
  { id: 'loc-6', name: 'Tamil Nadu', facilityCount: 8, region: 'south' },
  { id: 'loc-7', name: 'Andhra Pradesh', facilityCount: 7, region: 'south' },
  { id: 'loc-8', name: 'Kerala', facilityCount: 4, region: 'south' },
  
  // North India
  { id: 'loc-9', name: 'Uttar Pradesh', facilityCount: 8, region: 'north' },
  { id: 'loc-10', name: 'Delhi', facilityCount: 4, region: 'north' },
  { id: 'loc-11', name: 'Haryana', facilityCount: 4, region: 'north' },
  { id: 'loc-12', name: 'Rajasthan', facilityCount: 3, region: 'north' },
  { id: 'loc-13', name: 'Punjab', facilityCount: 2, region: 'north' },
  { id: 'loc-14', name: 'Uttarakhand', facilityCount: 2, region: 'north' },
  { id: 'loc-15', name: 'Himachal Pradesh', facilityCount: 2, region: 'north' },
  { id: 'loc-16', name: 'Jammu and Kashmir', facilityCount: 1, region: 'north' },
  
  // Central India
  { id: 'loc-17', name: 'Madhya Pradesh', facilityCount: 5, region: 'central' },
  { id: 'loc-18', name: 'Chhattisgarh', facilityCount: 2, region: 'central' },
  
  // East India
  { id: 'loc-19', name: 'West Bengal', facilityCount: 3, region: 'east' },
  { id: 'loc-20', name: 'Odisha', facilityCount: 3, region: 'east' },
  { id: 'loc-21', name: 'Jharkhand', facilityCount: 2, region: 'east' },
  { id: 'loc-22', name: 'Bihar', facilityCount: 2, region: 'east' },
  
  // Northeast India
  { id: 'loc-23', name: 'Assam', facilityCount: 1, region: 'northeast' },
];

// Total facilities
export const TOTAL_FACILITIES = 121;

// Helper functions
export function getChemistryById(id: string): Chemistry | undefined {
  return chemistries.find(c => c.id === id);
}

export function getAccreditationById(id: string): Accreditation | undefined {
  return accreditations.find(a => a.id === id);
}

export function getLocationById(id: string): StateLocation | undefined {
  return stateLocations.find(l => l.id === id);
}

export function getLocationByName(name: string): StateLocation | undefined {
  return stateLocations.find(l => 
    l.name.toLowerCase() === name.toLowerCase()
  );
}

// Calculate filtered facility count (approximate based on filter overlap)
export function calculateFilteredFacilities(filters: FilterState): number {
  const { chemistries: chemIds, accreditations: accIds, locations: locIds } = filters;
  
  // If no filters, return total
  if (chemIds.length === 0 && accIds.length === 0 && locIds.length === 0) {
    return TOTAL_FACILITIES;
  }
  
  let baseCount = TOTAL_FACILITIES;
  
  // Location filter is the most restrictive
  if (locIds.length > 0) {
    baseCount = stateLocations
      .filter(l => locIds.includes(l.id))
      .reduce((sum, l) => sum + l.facilityCount, 0);
  }
  
  // Apply chemistry filter factor
  if (chemIds.length > 0 && chemIds.length < chemistries.length) {
    const chemFactor = Math.min(1, chemIds.length / 5 + 0.3);
    baseCount = Math.ceil(baseCount * chemFactor);
  }
  
  // Apply accreditation filter factor
  if (accIds.length > 0 && accIds.length < accreditations.length) {
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

