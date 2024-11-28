export interface FilterOptions {
  populationRange: Array<{
    min: number;
    max: number;
  }>;
  areaRange: {
    min: number;
    max: number;
  };
  languages: string[];
  currencies: string[];
  regions: string[];
} 