import { differenceInDays } from 'date-fns';
import { type Gender, type Indicator, type SDBandPoint, kemenkesData } from '../data/kemenkes-standards';

export function calculateAgeInMonths(dob: Date, measurementDate: Date): number {
  const days = differenceInDays(measurementDate, dob);
  return Number((days / 30.4375).toFixed(2));
}

export function getTableData(indicator: Indicator, gender: Gender): SDBandPoint[] {
  const genderKey = gender === 'L' ? 'boys' : 'girls';
  
  if (indicator === 'BBU') {
    return kemenkesData.weight_for_age[genderKey].data.map((d: any) => ({ ...d, x: d.age_month }));
  }
  if (indicator === 'TBU') {
    return kemenkesData.length_height_for_age[genderKey].data.map((d: any) => ({ ...d, x: d.age_month }));
  }
  if (indicator === 'BBTB') {
    const arr1 = kemenkesData.weight_for_length_height[genderKey].weight_for_length_0_24.map((d: any) => ({ ...d, x: d.length_cm }));
    const arr2 = kemenkesData.weight_for_length_height[genderKey].weight_for_height_24_60.map((d: any) => ({ ...d, x: d.height_cm }));
    
    const combinedMap = new Map();
    [...arr1, ...arr2].forEach(item => combinedMap.set(item.x, item));
    return Array.from(combinedMap.values()).sort((a, b) => a.x - b.x);
  }
  if (indicator === 'IMTU') {
    return kemenkesData.bmi_for_age[genderKey].age_0_60_months.map((d: any) => ({ ...d, x: d.age_month }));
  }
  
  return [];
}

export function getSDBands(indicator: Indicator, gender: Gender, x: number): SDBandPoint | null {
  const table = getTableData(indicator, gender);
  if (!table || table.length === 0) return null;
  
  if (x <= table[0].x) return table[0];
  if (x >= table[table.length - 1].x) return table[table.length - 1];

  for (let i = 0; i < table.length - 1; i++) {
    const p1 = table[i];
    const p2 = table[i + 1];

    if (x >= p1.x && x <= p2.x) {
      if (p1.x === p2.x) return p1;
      const ratio = (x - p1.x) / (p2.x - p1.x);
      return {
        x,
        sd3neg: p1.sd3neg + (p2.sd3neg - p1.sd3neg) * ratio,
        sd2neg: p1.sd2neg + (p2.sd2neg - p1.sd2neg) * ratio,
        sd1neg: p1.sd1neg + (p2.sd1neg - p1.sd1neg) * ratio,
        median: p1.median + (p2.median - p1.median) * ratio,
        sd1pos: p1.sd1pos + (p2.sd1pos - p1.sd1pos) * ratio,
        sd2pos: p1.sd2pos + (p2.sd2pos - p1.sd2pos) * ratio,
        sd3pos: p1.sd3pos + (p2.sd3pos - p1.sd3pos) * ratio,
      };
    }
  }
  return null;
}

export function calculateZScore(y: number, bands: SDBandPoint): number {
  if (y === bands.median) return 0;
  
  if (y > bands.median) {
    if (y <= bands.sd1pos) return (y - bands.median) / (bands.sd1pos - bands.median);
    if (y <= bands.sd2pos) return 1 + (y - bands.sd1pos) / (bands.sd2pos - bands.sd1pos);
    if (y <= bands.sd3pos) return 2 + (y - bands.sd2pos) / (bands.sd3pos - bands.sd2pos);
    return 3 + (y - bands.sd3pos) / (bands.sd3pos - bands.sd2pos);
  } else {
    if (y >= bands.sd1neg) return -(bands.median - y) / (bands.median - bands.sd1neg);
    if (y >= bands.sd2neg) return -1 - (bands.sd1neg - y) / (bands.sd1neg - bands.sd2neg);
    if (y >= bands.sd3neg) return -2 - (bands.sd2neg - y) / (bands.sd2neg - bands.sd3neg);
    return -3 - (bands.sd3neg - y) / (bands.sd2neg - bands.sd3neg);
  }
}

export function getNutritionalStatus(indicator: Indicator, zScore: number): { label: string; color: string } {
  if (indicator === 'BBU') {
    if (zScore < -3) return { label: 'Berat badan sangat kurang', color: 'bg-red-500' };
    if (zScore < -2) return { label: 'Berat badan kurang', color: 'bg-yellow-500' };
    if (zScore <= 1) return { label: 'Berat badan normal', color: 'bg-green-500' };
    return { label: 'Risiko berat badan lebih', color: 'bg-yellow-500' };
  }
  
  if (indicator === 'TBU') {
    if (zScore < -3) return { label: 'Sangat pendek (Severely stunted)', color: 'bg-red-500' };
    if (zScore < -2) return { label: 'Pendek (Stunted)', color: 'bg-yellow-500' };
    if (zScore <= 3) return { label: 'Normal', color: 'bg-green-500' };
    return { label: 'Tinggi', color: 'bg-blue-500' };
  }

  if (zScore < -3) return { label: 'Gizi buruk', color: 'bg-red-500' };
  if (zScore < -2) return { label: 'Gizi kurang', color: 'bg-yellow-500' };
  if (zScore <= 1) return { label: 'Gizi baik (Normal)', color: 'bg-green-500' };
  if (zScore <= 2) return { label: 'Berisiko gizi lebih', color: 'bg-yellow-500' };
  if (zScore <= 3) return { label: 'Gizi lebih (Overweight)', color: 'bg-orange-500' };
  return { label: 'Obesitas', color: 'bg-red-600' };
}
