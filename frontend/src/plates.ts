/**
 * Plate calculator: given a target total weight and a barbell weight,
 * computes the plate combination (per side) using standard kg plates.
 */
export type PlateBreakdown = {
  perSide: { plate: number; count: number }[];
  totalPerSide: number;
  total: number;
  remaining: number; // unreachable with available plates
};

export const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];

export function calculatePlates(
  totalKg: number,
  barKg: number,
  availablePlates: number[] = STANDARD_PLATES_KG,
): PlateBreakdown {
  const perSideKg = Math.max(0, (totalKg - barKg) / 2);
  let remaining = perSideKg;
  const result: { plate: number; count: number }[] = [];
  // Plates sorted desc
  const plates = [...availablePlates].sort((a, b) => b - a);
  for (const p of plates) {
    const count = Math.floor(remaining / p + 1e-9);
    if (count > 0) {
      result.push({ plate: p, count });
      remaining -= count * p;
    }
  }
  // Round remaining to avoid floating point noise
  remaining = Math.round(remaining * 100) / 100;
  const totalPerSide =
    result.reduce((s, x) => s + x.plate * x.count, 0);
  return {
    perSide: result,
    totalPerSide,
    total: totalPerSide * 2 + barKg,
    remaining,
  };
}
