import { type Gender, type Indicator, type LMSPoint, lmsData } from '../data/lms-reference';
import { differenceInDays } from 'date-fns';

export function calculateAgeInMonths(dob: Date, measurementDate: Date): number {
  // Simple calculation: we can just use differenceInDays / 30.4375 for precision
  const days = differenceInDays(measurementDate, dob);
  return Number((days / 30.4375).toFixed(2));
}

// Find L, M, S for a given X by interpolating if necessary
export function getInterpolatedLMS(indicator: Indicator, gender: Gender, x: number): LMSPoint | null {
  const table = lmsData[indicator][gender];
  
  if (x < table[0].x) return table[0]; // Clamping to min
  if (x > table[table.length - 1].x) return table[table.length - 1]; // Clamping to max

  for (let i = 0; i < table.length - 1; i++) {
    const p1 = table[i];
    const p2 = table[i + 1];

    if (x >= p1.x && x <= p2.x) {
      if (p1.x === p2.x) return p1;
      // Linear interpolation
      const ratio = (x - p1.x) / (p2.x - p1.x);
      return {
        x,
        L: p1.L + (p2.L - p1.L) * ratio,
        M: p1.M + (p2.M - p1.M) * ratio,
        S: p1.S + (p2.S - p1.S) * ratio,
      };
    }
  }
  return null;
}

export function calculateZScore(y: number, lms: LMSPoint): number {
  const { L, M, S } = lms;
  if (L === 0) {
    return Math.log(y / M) / S;
  }
  return (Math.pow(y / M, L) - 1) / (L * S);
}

export function calculateSDValue(z: number, lms: LMSPoint): number {
  const { L, M, S } = lms;
  if (L === 0) {
    return M * Math.exp(S * z);
  }
  return M * Math.pow(1 + L * S * z, 1 / L);
}

export function getNutritionalStatus(indicator: Indicator, zScore: number): { label: string; color: string } {
  if (indicator === 'BBU') {
    if (zScore < -3) return { label: 'Sangat Kurang', color: 'bg-red-500' };
    if (zScore < -2) return { label: 'Kurang', color: 'bg-yellow-500' };
    if (zScore <= 1) return { label: 'Normal', color: 'bg-green-500' };
    return { label: 'Risiko Lebih', color: 'bg-yellow-500' };
  }
  
  if (indicator === 'TBU') {
    if (zScore < -3) return { label: 'Sangat Pendek (Severely Stunted)', color: 'bg-red-500' };
    if (zScore < -2) return { label: 'Pendek (Stunted)', color: 'bg-yellow-500' };
    if (zScore <= 3) return { label: 'Normal', color: 'bg-green-500' };
    return { label: 'Tinggi', color: 'bg-blue-500' };
  }

  // BBTB and IMTU share similar categories
  if (zScore < -3) return { label: 'Gizi Buruk', color: 'bg-red-500' };
  if (zScore < -2) return { label: 'Gizi Kurang', color: 'bg-yellow-500' };
  if (zScore <= 1) return { label: 'Gizi Baik (Normal)', color: 'bg-green-500' };
  if (zScore <= 2) return { label: 'Risiko Gizi Lebih', color: 'bg-yellow-500' };
  if (zScore <= 3) return { label: 'Gizi Lebih', color: 'bg-orange-500' };
  return { label: 'Obesitas', color: 'bg-red-600' };
}
