import standardsData from './who_kemenkes_growth_standards.json';

export type Gender = 'L' | 'P';
export type Indicator = 'BBU' | 'TBU' | 'BBTB' | 'IMTU';

export interface SDBandPoint {
  x: number;
  sd3neg: number;
  sd2neg: number;
  sd1neg: number;
  median: number;
  sd1pos: number;
  sd2pos: number;
  sd3pos: number;
}

export const kemenkesData = standardsData;
