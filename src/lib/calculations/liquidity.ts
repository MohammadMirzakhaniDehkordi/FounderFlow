/**
 * Liquidity Calculation Engine
 * 
 * Calculates monthly cash flow including:
 * - Revenue inflows
 * - Operating cost outflows
 * - Personnel costs
 * - Investment costs
 * - Loan payments
 * - Tax payments
 */

import type {
  RevenueData,
  PersonnelData,
  OperatingCostsData,
  InvestmentsData,
  LoansData,
  MonthlyCalculation,
  YearSummary,
} from "../types";
import { calculateTaxes, calculateUGReserve } from "./taxes";
import { calculateMonthlyLoanCosts, getTotalRemainingLoanBalance } from "./loans";

export interface LiquidityInput {
  startYear: number;
  startingLiquidity: number;
  stammkapital: number;
  hebesatz: number;
  revenue: RevenueData;
  personnel: PersonnelData;
  operatingCosts: OperatingCostsData;
  investments: InvestmentsData;
  loans: LoansData;
}

export interface LiquidityResult {
  months: Record<string, MonthlyCalculation>;
  yearSummaries: Record<number, YearSummary>;
}

/**
 * Generate array of month keys for 3 years
 */
export function generateMonthKeys(startYear: number, numYears: number = 3): string[] {
  const months: string[] = [];
  for (let year = startYear; year < startYear + numYears; year++) {
    for (let month = 1; month <= 12; month++) {
      months.push(`${year}-${String(month).padStart(2, "0")}`);
    }
  }
  return months;
}

/**
 * Get revenue for a specific month
 */
function getMonthlyRevenue(revenue: RevenueData, month: string): number {
  if (revenue.months && revenue.months[month]) {
    return revenue.months[month].total || 0;
  }
  
  if (revenue.revenueModel === "fixed" && revenue.fixedMonthlyRevenue) {
    return revenue.fixedMonthlyRevenue;
  }
  
  return 0;
}

/**
 * Get personnel costs for a specific month
 */
function getMonthlyPersonnelCosts(personnel: PersonnelData, month: string): number {
  if (!personnel.employees || personnel.employees.length === 0) {
    return 0;
  }

  let total = 0;
  for (const employee of personnel.employees) {
    // Check if employee is active in this month
    if (employee.startMonth <= month && (!employee.endMonth || employee.endMonth >= month)) {
      total += employee.monthlySalary;
    }
  }

  return total;
}

/**
 * Get operating costs for a specific month
 */
function getMonthlyOperatingCosts(costs: OperatingCostsData, month: string): number {
  const baseCategories = costs.categories || {
    rent: 0,
    marketing: 0,
    insurance: 0,
    software: 0,
    legal: 0,
    accounting: 0,
    other: 0,
  };

  // Calculate base total
  let total = Object.values(baseCategories).reduce((sum, val) => sum + (val || 0), 0);

  // Apply monthly overrides if any
  if (costs.monthlyOverrides && costs.monthlyOverrides[month]) {
    const overrides = costs.monthlyOverrides[month];
    for (const [key, value] of Object.entries(overrides)) {
      if (value !== undefined) {
        // Replace base value with override
        const baseKey = key as keyof typeof baseCategories;
        total = total - (baseCategories[baseKey] || 0) + value;
      }
    }
  }

  return total;
}

/**
 * Get investment costs for a specific month
 */
function getMonthlyInvestmentCosts(investments: InvestmentsData, month: string): number {
  if (!investments.items || investments.items.length === 0) {
    return 0;
  }

  return investments.items
    .filter((item) => item.month === month)
    .reduce((sum, item) => sum + item.amount, 0);
}

/**
 * Calculate full liquidity plan
 */
export function calculateLiquidity(input: LiquidityInput): LiquidityResult {
  const {
    startYear,
    startingLiquidity,
    stammkapital,
    hebesatz,
    revenue,
    personnel,
    operatingCosts,
    investments,
    loans,
  } = input;

  const monthKeys = generateMonthKeys(startYear, 3);
  const months: Record<string, MonthlyCalculation> = {};
  const yearSummaries: Record<number, YearSummary> = {};

  let currentBalance = startingLiquidity;
  let cumulativeStammkapital = stammkapital;

  // Track yearly totals for tax calculation
  const yearlyTotals: Record<number, {
    revenue: number;
    costs: number;
    profit: number;
  }> = {};

  // Initialize yearly totals
  for (let year = startYear; year < startYear + 3; year++) {
    yearlyTotals[year] = { revenue: 0, costs: 0, profit: 0 };
  }

  // Calculate each month
  for (const month of monthKeys) {
    const [yearStr] = month.split("-");
    const year = parseInt(yearStr);
    const startBalance = currentBalance;

    // Calculate inflows
    const revenueAmount = getMonthlyRevenue(revenue, month);
    const otherIncome = 0; // Could be extended
    const totalInflows = revenueAmount + otherIncome;

    // Calculate outflows
    const personnelCosts = getMonthlyPersonnelCosts(personnel, month);
    const operatingCostsAmount = getMonthlyOperatingCosts(operatingCosts, month);
    const investmentCosts = getMonthlyInvestmentCosts(investments, month);

    // Loan costs
    const loanCosts = loans.loans
      ? calculateMonthlyLoanCosts(loans.loans, month)
      : { totalPayment: 0, totalPrincipal: 0, totalInterest: 0, totalProvisionFees: 0 };

    const totalOutflows =
      personnelCosts +
      operatingCostsAmount +
      investmentCosts +
      loanCosts.totalPayment;

    // Net cashflow
    const netCashflow = totalInflows - totalOutflows;
    const endBalance = startBalance + netCashflow;

    // Update current balance
    currentBalance = endBalance;

    // Track yearly totals (excluding loan principal as it's not an expense)
    const monthlyExpenses = personnelCosts + operatingCostsAmount + investmentCosts + loanCosts.totalInterest;
    yearlyTotals[year].revenue += revenueAmount;
    yearlyTotals[year].costs += monthlyExpenses;
    yearlyTotals[year].profit = yearlyTotals[year].revenue - yearlyTotals[year].costs;

    // Estimate taxes (prorated monthly based on year-to-date profit)
    const ytdProfit = yearlyTotals[year].profit;
    const monthNumber = parseInt(month.split("-")[1]);
    const annualizedProfit = (ytdProfit / monthNumber) * 12;
    const taxEstimate = calculateTaxes({ taxableProfit: annualizedProfit, hebesatz });
    const monthlyTaxEstimate = {
      koerperschaftsteuer: taxEstimate.koerperschaftsteuer / 12,
      gewerbesteuer: taxEstimate.gewerbesteuer / 12,
      solidaritaetszuschlag: taxEstimate.solidaritaetszuschlag / 12,
    };

    // Get remaining loan balance
    const loanRemainingBalance = loans.loans
      ? getTotalRemainingLoanBalance(loans.loans, month)
      : 0;

    months[month] = {
      month,
      revenue: Math.round(revenueAmount * 100) / 100,
      otherIncome: Math.round(otherIncome * 100) / 100,
      totalInflows: Math.round(totalInflows * 100) / 100,
      personnelCosts: Math.round(personnelCosts * 100) / 100,
      operatingCosts: Math.round(operatingCostsAmount * 100) / 100,
      investmentCosts: Math.round(investmentCosts * 100) / 100,
      loanInterest: Math.round(loanCosts.totalInterest * 100) / 100,
      loanPrincipal: Math.round(loanCosts.totalPrincipal * 100) / 100,
      totalOutflows: Math.round(totalOutflows * 100) / 100,
      netCashflow: Math.round(netCashflow * 100) / 100,
      startBalance: Math.round(startBalance * 100) / 100,
      endBalance: Math.round(endBalance * 100) / 100,
      koerperschaftsteuer: Math.round(monthlyTaxEstimate.koerperschaftsteuer * 100) / 100,
      gewerbesteuer: Math.round(monthlyTaxEstimate.gewerbesteuer * 100) / 100,
      solidaritaetszuschlag: Math.round(monthlyTaxEstimate.solidaritaetszuschlag * 100) / 100,
      loanRemainingBalance: Math.round(loanRemainingBalance * 100) / 100,
    };
  }

  // Calculate year summaries
  for (let year = startYear; year < startYear + 3; year++) {
    const yearMonths = monthKeys.filter((m) => m.startsWith(`${year}-`));
    
    const totalRevenue = yearMonths.reduce((sum, m) => sum + months[m].revenue, 0);
    const totalPersonnel = yearMonths.reduce((sum, m) => sum + months[m].personnelCosts, 0);
    const totalOperating = yearMonths.reduce((sum, m) => sum + months[m].operatingCosts, 0);
    const totalInvestment = yearMonths.reduce((sum, m) => sum + months[m].investmentCosts, 0);
    const totalLoanInterest = yearMonths.reduce((sum, m) => sum + months[m].loanInterest, 0);
    
    const totalCosts = totalPersonnel + totalOperating + totalInvestment + totalLoanInterest;
    const grossProfit = totalRevenue - totalPersonnel;
    const operatingProfit = grossProfit - totalOperating;
    const profitBeforeTax = totalRevenue - totalCosts;

    // Calculate actual annual taxes
    const taxResult = calculateTaxes({ taxableProfit: profitBeforeTax, hebesatz });
    const netProfit = profitBeforeTax - taxResult.totalTaxes;

    // Calculate UG reserve
    const ugReserve = calculateUGReserve(netProfit, cumulativeStammkapital);
    cumulativeStammkapital += ugReserve;

    // Get end liquidity (last month of year)
    const lastMonth = yearMonths[yearMonths.length - 1];
    const endLiquidity = months[lastMonth].endBalance;

    yearSummaries[year] = {
      year,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCosts: Math.round(totalCosts * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      operatingProfit: Math.round(operatingProfit * 100) / 100,
      profitBeforeTax: Math.round(profitBeforeTax * 100) / 100,
      totalTaxes: Math.round(taxResult.totalTaxes * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      endLiquidity: Math.round(endLiquidity * 100) / 100,
      ugReserve: Math.round(ugReserve * 100) / 100,
    };
  }

  return { months, yearSummaries };
}

/**
 * Check if liquidity ever goes negative
 */
export function checkLiquidityWarnings(
  result: LiquidityResult
): { month: string; balance: number }[] {
  const warnings: { month: string; balance: number }[] = [];

  for (const [month, calc] of Object.entries(result.months)) {
    if (calc.endBalance < 0) {
      warnings.push({ month, balance: calc.endBalance });
    }
  }

  return warnings;
}

/**
 * Calculate break-even month
 */
export function findBreakEvenMonth(result: LiquidityResult): string | null {
  let previousProfit = -Infinity;

  for (const [month, calc] of Object.entries(result.months)) {
    const monthlyProfit = calc.revenue - (calc.personnelCosts + calc.operatingCosts);
    
    if (previousProfit < 0 && monthlyProfit >= 0) {
      return month;
    }
    
    previousProfit = monthlyProfit;
  }

  return null;
}
