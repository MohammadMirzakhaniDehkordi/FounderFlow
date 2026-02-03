/**
 * German Tax Calculations for UG (Unternehmergesellschaft)
 * 
 * Key taxes:
 * - Körperschaftsteuer: 15% flat rate on taxable profit
 * - Solidaritätszuschlag: 5.5% of Körperschaftsteuer
 * - Gewerbesteuer: (profit × 3.5% base rate) × (Hebesatz / 100)
 * 
 * Note: UG has NO Gewerbesteuerfreibetrag (unlike sole proprietors who get €24,500)
 */

export interface TaxCalculationInput {
  taxableProfit: number;
  hebesatz: number; // Municipal trade tax rate (e.g., 410 for Munich)
}

export interface TaxCalculationResult {
  koerperschaftsteuer: number;
  solidaritaetszuschlag: number;
  gewerbesteuer: number;
  totalTaxes: number;
  effectiveTaxRate: number;
}

/**
 * Calculate all taxes for a German UG
 */
export function calculateTaxes(input: TaxCalculationInput): TaxCalculationResult {
  const { taxableProfit, hebesatz } = input;

  // No taxes if profit is negative or zero
  if (taxableProfit <= 0) {
    return {
      koerperschaftsteuer: 0,
      solidaritaetszuschlag: 0,
      gewerbesteuer: 0,
      totalTaxes: 0,
      effectiveTaxRate: 0,
    };
  }

  // Körperschaftsteuer: 15% flat rate
  const koerperschaftsteuer = taxableProfit * 0.15;

  // Solidaritätszuschlag: 5.5% of Körperschaftsteuer
  const solidaritaetszuschlag = koerperschaftsteuer * 0.055;

  // Gewerbesteuer calculation:
  // Steuermessbetrag = Gewinn × 3.5% (Steuermesszahl)
  // Gewerbesteuer = Steuermessbetrag × (Hebesatz / 100)
  // Combined: Gewinn × 0.035 × (Hebesatz / 100)
  const gewerbesteuer = taxableProfit * 0.035 * (hebesatz / 100);

  const totalTaxes = koerperschaftsteuer + solidaritaetszuschlag + gewerbesteuer;
  const effectiveTaxRate = taxableProfit > 0 ? (totalTaxes / taxableProfit) * 100 : 0;

  return {
    koerperschaftsteuer: Math.round(koerperschaftsteuer * 100) / 100,
    solidaritaetszuschlag: Math.round(solidaritaetszuschlag * 100) / 100,
    gewerbesteuer: Math.round(gewerbesteuer * 100) / 100,
    totalTaxes: Math.round(totalTaxes * 100) / 100,
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
  };
}

/**
 * Calculate monthly tax estimate (for liquidity planning)
 * Taxes are typically paid quarterly, but we estimate monthly for planning
 */
export function calculateMonthlyTaxEstimate(
  monthlyProfit: number,
  hebesatz: number
): TaxCalculationResult {
  return calculateTaxes({
    taxableProfit: monthlyProfit,
    hebesatz,
  });
}

/**
 * Calculate UG mandatory reserve (gesetzliche Rücklage)
 * UG must retain 25% of annual profit until Stammkapital reaches €25,000
 */
export function calculateUGReserve(
  annualProfit: number,
  currentStammkapital: number
): number {
  // No reserve required if already at €25,000 or more
  if (currentStammkapital >= 25000) {
    return 0;
  }

  // No reserve if no profit
  if (annualProfit <= 0) {
    return 0;
  }

  // Calculate required reserve: 25% of profit, but max until €25,000 total
  const remainingToReach25k = 25000 - currentStammkapital;
  const quarterOfProfit = annualProfit * 0.25;

  return Math.round(Math.min(quarterOfProfit, remainingToReach25k) * 100) / 100;
}

/**
 * Calculate cumulative Stammkapital including reserves over multiple years
 */
export function calculateCumulativeStammkapital(
  initialStammkapital: number,
  yearlyProfits: number[]
): number[] {
  const result: number[] = [];
  let currentKapital = initialStammkapital;

  for (const profit of yearlyProfits) {
    const reserve = calculateUGReserve(profit, currentKapital);
    currentKapital += reserve;
    result.push(Math.round(currentKapital * 100) / 100);
  }

  return result;
}

/**
 * Common Hebesatz values for major German cities
 */
export const HEBESATZ_DATA: Record<string, number> = {
  // Major cities
  "Berlin": 410,
  "Hamburg": 470,
  "München": 490,
  "Köln": 475,
  "Frankfurt am Main": 460,
  "Stuttgart": 420,
  "Düsseldorf": 440,
  "Leipzig": 460,
  "Dortmund": 485,
  "Essen": 480,
  "Bremen": 460,
  "Dresden": 450,
  "Hannover": 480,
  "Nürnberg": 447,
  "Duisburg": 520,
  // Smaller cities often have lower rates
  "Monheim am Rhein": 250,
  "Grünwald": 240,
  "Schönefeld": 300,
};

/**
 * Get Hebesatz for a city, with fallback to German average
 */
export function getHebesatzForCity(city: string): number {
  return HEBESATZ_DATA[city] || 400; // 400 is roughly the German average
}
