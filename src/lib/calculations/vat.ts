/**
 * VAT (Umsatzsteuer) Calculations for German UG
 * 
 * Key concepts:
 * - Standard VAT rate: 19%
 * - Reduced VAT rate: 7% (food, books, etc.)
 * - Kleinunternehmerregelung (§19 UStG): No VAT if revenue < €22,000/year
 * - VAT collected (Eingenommene USt) - VAT on sales
 * - Input VAT (Vorsteuer) - VAT on purchases
 * - VAT payable (Umsatzsteuerzahllast) = Collected - Input
 */

export const VAT_RATES = {
  STANDARD: 0.19, // 19%
  REDUCED: 0.07, // 7%
  EXEMPT: 0, // 0%
} as const;

// Threshold for Kleinunternehmerregelung (§19 UStG)
export const SMALL_BUSINESS_THRESHOLD = 22000; // €22,000 annual revenue

export interface VATCalculationInput {
  grossRevenue: number; // Revenue including VAT
  netRevenue: number; // Revenue excluding VAT
  operatingCostsNet: number; // Operating costs excluding VAT
  investmentsNet: number; // Investments excluding VAT
  isSmallBusiness: boolean; // Kleinunternehmer status
  vatRate?: number; // Default 19%
}

export interface VATCalculationResult {
  vatCollected: number; // Eingenommene Umsatzsteuer
  vatPaid: number; // Vorsteuer (input VAT on costs)
  vatPayable: number; // Umsatzsteuerzahllast (to pay to Finanzamt)
  netRevenue: number; // Revenue without VAT
  grossRevenue: number; // Revenue with VAT
}

/**
 * Calculate net revenue from gross (including VAT)
 */
export function calculateNetFromGross(grossAmount: number, vatRate: number = VAT_RATES.STANDARD): number {
  return Math.round((grossAmount / (1 + vatRate)) * 100) / 100;
}

/**
 * Calculate gross revenue from net (excluding VAT)
 */
export function calculateGrossFromNet(netAmount: number, vatRate: number = VAT_RATES.STANDARD): number {
  return Math.round((netAmount * (1 + vatRate)) * 100) / 100;
}

/**
 * Calculate VAT amount from net value
 */
export function calculateVATFromNet(netAmount: number, vatRate: number = VAT_RATES.STANDARD): number {
  return Math.round((netAmount * vatRate) * 100) / 100;
}

/**
 * Calculate VAT amount from gross value
 */
export function calculateVATFromGross(grossAmount: number, vatRate: number = VAT_RATES.STANDARD): number {
  const netAmount = calculateNetFromGross(grossAmount, vatRate);
  return Math.round((grossAmount - netAmount) * 100) / 100;
}

/**
 * Calculate monthly VAT (Umsatzsteuer) for a business
 * 
 * @param netRevenue - Revenue without VAT
 * @param netExpenses - Deductible expenses without VAT (for input VAT calculation)
 * @param isSmallBusiness - Whether Kleinunternehmerregelung applies
 * @param vatRate - VAT rate (default 19%)
 */
export function calculateMonthlyVAT(
  netRevenue: number,
  netExpenses: number,
  isSmallBusiness: boolean = false,
  vatRate: number = VAT_RATES.STANDARD
): VATCalculationResult {
  // Small business (Kleinunternehmer) doesn't charge or claim VAT
  if (isSmallBusiness) {
    return {
      vatCollected: 0,
      vatPaid: 0,
      vatPayable: 0,
      netRevenue: netRevenue,
      grossRevenue: netRevenue, // No VAT added
    };
  }

  // VAT collected on revenue (Eingenommene Umsatzsteuer)
  const vatCollected = calculateVATFromNet(netRevenue, vatRate);
  
  // Input VAT on expenses (Vorsteuer)
  // Note: Not all expenses include VAT (e.g., salaries don't have VAT)
  // Typically ~80% of operating costs have VAT
  const vatPaid = calculateVATFromNet(netExpenses * 0.8, vatRate);
  
  // Net VAT to pay (Umsatzsteuerzahllast)
  const vatPayable = Math.round((vatCollected - vatPaid) * 100) / 100;
  
  // Gross revenue (including VAT)
  const grossRevenue = calculateGrossFromNet(netRevenue, vatRate);

  return {
    vatCollected,
    vatPaid,
    vatPayable,
    netRevenue,
    grossRevenue,
  };
}

/**
 * Check if business qualifies for Kleinunternehmerregelung
 */
export function checkSmallBusinessStatus(
  previousYearRevenue: number,
  currentYearExpectedRevenue: number
): boolean {
  // Requirements:
  // 1. Previous year revenue <= €22,000
  // 2. Current year expected revenue <= €50,000
  return previousYearRevenue <= SMALL_BUSINESS_THRESHOLD && currentYearExpectedRevenue <= 50000;
}

/**
 * Calculate quarterly VAT prepayment
 * (Umsatzsteuer-Voranmeldung - due monthly or quarterly)
 */
export function calculateQuarterlyVAT(
  monthlyVATPayables: number[]
): number {
  return monthlyVATPayables.reduce((sum, vat) => sum + vat, 0);
}

/**
 * Calculate annual VAT summary
 */
export function calculateAnnualVAT(
  monthlyData: Array<{
    netRevenue: number;
    netExpenses: number;
  }>,
  isSmallBusiness: boolean = false,
  vatRate: number = VAT_RATES.STANDARD
): {
  totalVatCollected: number;
  totalVatPaid: number;
  totalVatPayable: number;
  quarterlyPayments: number[];
} {
  if (isSmallBusiness) {
    return {
      totalVatCollected: 0,
      totalVatPaid: 0,
      totalVatPayable: 0,
      quarterlyPayments: [0, 0, 0, 0],
    };
  }

  const monthlyResults = monthlyData.map((month) =>
    calculateMonthlyVAT(month.netRevenue, month.netExpenses, false, vatRate)
  );

  const totalVatCollected = monthlyResults.reduce((sum, m) => sum + m.vatCollected, 0);
  const totalVatPaid = monthlyResults.reduce((sum, m) => sum + m.vatPaid, 0);
  const totalVatPayable = Math.round((totalVatCollected - totalVatPaid) * 100) / 100;

  // Calculate quarterly payments (sum of 3 months each)
  const quarterlyPayments = [
    monthlyResults.slice(0, 3).reduce((sum, m) => sum + m.vatPayable, 0),
    monthlyResults.slice(3, 6).reduce((sum, m) => sum + m.vatPayable, 0),
    monthlyResults.slice(6, 9).reduce((sum, m) => sum + m.vatPayable, 0),
    monthlyResults.slice(9, 12).reduce((sum, m) => sum + m.vatPayable, 0),
  ];

  return {
    totalVatCollected: Math.round(totalVatCollected * 100) / 100,
    totalVatPaid: Math.round(totalVatPaid * 100) / 100,
    totalVatPayable,
    quarterlyPayments: quarterlyPayments.map((q) => Math.round(q * 100) / 100),
  };
}
