/**
 * Loan Amortization Calculations
 * 
 * Supports:
 * - Annuity loans (equal monthly payments)
 * - Grace periods (tilgungsfreie Zeit)
 * - Bank provision fees (Bereitstellungsentgelt)
 */

import type { Loan } from "../types";

export interface LoanPayment {
  month: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  provisionFee: number;
}

export interface LoanSchedule {
  payments: LoanPayment[];
  totalInterest: number;
  totalPrincipal: number;
  totalProvisionFees: number;
}

/**
 * Calculate monthly payment for an annuity loan
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRate / 12;
  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return Math.round(payment * 100) / 100;
}

/**
 * Generate full amortization schedule for a loan
 */
export function generateLoanSchedule(
  loan: Loan,
  startMonth: string,
  numMonths: number = 36 // Default to 3 years
): LoanSchedule {
  const payments: LoanPayment[] = [];
  let remainingBalance = loan.amount;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let totalProvisionFees = 0;

  const monthlyRate = loan.interestRate / 12;
  const repaymentTermMonths = loan.termMonths - loan.gracePeriodMonths;
  
  // Calculate monthly payment for repayment period
  const monthlyPayment = calculateMonthlyPayment(
    loan.amount,
    loan.interestRate,
    repaymentTermMonths > 0 ? repaymentTermMonths : loan.termMonths
  );

  // Parse start month
  const [startYear, startMonthNum] = startMonth.split("-").map(Number);
  let currentYear = startYear;
  let currentMonth = startMonthNum;

  for (let i = 0; i < numMonths && remainingBalance > 0.01; i++) {
    const monthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    
    // Check if still in grace period
    const isGracePeriod = i < loan.gracePeriodMonths;
    
    // Calculate interest for this month
    const monthlyInterest = remainingBalance * monthlyRate;
    
    // Calculate principal (0 during grace period)
    let principal = 0;
    let payment = monthlyInterest; // During grace period, only pay interest
    
    if (!isGracePeriod) {
      // Normal payment period
      payment = Math.min(monthlyPayment, remainingBalance + monthlyInterest);
      principal = payment - monthlyInterest;
      
      // Handle final payment
      if (principal > remainingBalance) {
        principal = remainingBalance;
        payment = principal + monthlyInterest;
      }
    }
    
    // Calculate provision fee (typically charged before loan disbursement)
    // Usually 0.15% per month on undisbursed amount during construction phase
    const provisionFee = loan.provisionFee && i === 0 ? loan.provisionFee : 0;
    
    // Update remaining balance
    remainingBalance = Math.max(0, remainingBalance - principal);
    
    // Track totals
    totalInterest += monthlyInterest;
    totalPrincipal += principal;
    totalProvisionFees += provisionFee;

    payments.push({
      month: monthKey,
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(monthlyInterest * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      provisionFee: Math.round(provisionFee * 100) / 100,
    });

    // Move to next month
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return {
    payments,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPrincipal: Math.round(totalPrincipal * 100) / 100,
    totalProvisionFees: Math.round(totalProvisionFees * 100) / 100,
  };
}

/**
 * Calculate total loan costs for a specific month across all loans
 */
export function calculateMonthlyLoanCosts(
  loans: Loan[],
  month: string
): {
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalProvisionFees: number;
  remainingBalances: Record<string, number>;
} {
  let totalPayment = 0;
  let totalPrincipal = 0;
  let totalInterest = 0;
  let totalProvisionFees = 0;
  const remainingBalances: Record<string, number> = {};

  for (const loan of loans) {
    // Check if loan has started
    if (loan.startMonth > month) {
      remainingBalances[loan.id] = loan.amount;
      continue;
    }

    // Generate schedule and find the payment for this month
    const schedule = generateLoanSchedule(loan, loan.startMonth, 60);
    const payment = schedule.payments.find((p) => p.month === month);

    if (payment) {
      totalPayment += payment.payment;
      totalPrincipal += payment.principal;
      totalInterest += payment.interest;
      totalProvisionFees += payment.provisionFee;
      remainingBalances[loan.id] = payment.remainingBalance;
    } else {
      // Loan might be paid off
      remainingBalances[loan.id] = 0;
    }
  }

  return {
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalPrincipal: Math.round(totalPrincipal * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalProvisionFees: Math.round(totalProvisionFees * 100) / 100,
    remainingBalances,
  };
}

/**
 * Calculate KfW-style provision fees
 * KfW charges Bereitstellungsprovision (provision fee) on undisbursed loan amounts
 */
export function calculateKfWProvisionFee(
  loanAmount: number,
  monthsBeforeDisbursement: number,
  provisionRate: number = 0.0015 // 0.15% per month is typical
): number {
  return Math.round(loanAmount * provisionRate * monthsBeforeDisbursement * 100) / 100;
}

/**
 * Calculate total remaining loan balance across all loans for a given month
 */
export function getTotalRemainingLoanBalance(
  loans: Loan[],
  month: string
): number {
  let total = 0;

  for (const loan of loans) {
    if (loan.startMonth > month) {
      total += loan.amount;
      continue;
    }

    const schedule = generateLoanSchedule(loan, loan.startMonth, 60);
    const payment = schedule.payments.find((p) => p.month === month);
    
    if (payment) {
      total += payment.remainingBalance;
    }
  }

  return Math.round(total * 100) / 100;
}
