/**
 * BWA (Betriebswirtschaftliche Auswertung) Generation
 * 
 * Creates the standard German business performance report format
 * used by banks for loan applications.
 */

import type { BWAData, BWARow, YearSummary, MonthlyCalculation } from "../types";
import { LiquidityResult } from "./liquidity";

export interface BWAInput {
  companyName: string;
  startYear: number;
  liquidityResult: LiquidityResult;
  // Additional details from plan data
  materialCosts?: number;
  geschaeftsfuehrerGehalt?: number;
}

/**
 * Calculate percentage of revenue
 */
function percentOfRevenue(value: number, revenue: number): number {
  if (revenue === 0) return 0;
  return Math.round((value / revenue) * 1000) / 10; // One decimal place
}

/**
 * Generate BWA data from liquidity calculation
 */
export function generateBWA(input: BWAInput): BWAData {
  const { companyName, startYear, liquidityResult } = input;
  const years: [number, number, number] = [startYear, startYear + 1, startYear + 2];

  const summaries = years.map((year) => liquidityResult.yearSummaries[year]);

  // Helper to get year data
  const getYearData = (
    label: string,
    getValue: (summary: YearSummary) => number,
    isSubtraction = false
  ): BWARow => {
    const values = summaries.map((s) => getValue(s));
    const revenues = summaries.map((s) => s.totalRevenue);

    return {
      label,
      year1Value: isSubtraction ? -values[0] : values[0],
      year1Percent: percentOfRevenue(values[0], revenues[0]),
      year2Value: isSubtraction ? -values[1] : values[1],
      year2Percent: percentOfRevenue(values[1], revenues[1]),
      year3Value: isSubtraction ? -values[2] : values[2],
      year3Percent: percentOfRevenue(values[2], revenues[2]),
    };
  };

  // Calculate detailed breakdown from monthly data
  const yearlyDetails = years.map((year) => {
    const yearMonths = Object.values(liquidityResult.months).filter((m) =>
      m.month.startsWith(`${year}-`)
    );

    return {
      personnel: yearMonths.reduce((sum, m) => sum + m.personnelCosts, 0),
      operating: yearMonths.reduce((sum, m) => sum + m.operatingCosts, 0),
      investment: yearMonths.reduce((sum, m) => sum + m.investmentCosts, 0),
      interest: yearMonths.reduce((sum, m) => sum + m.loanInterest, 0),
    };
  });

  const rows: BWARow[] = [
    // Revenue section
    getYearData("Umsatz", (s) => s.totalRevenue),
    {
      label: "+/- Bestandsveränderung",
      year1Value: 0,
      year1Percent: 0,
      year2Value: 0,
      year2Percent: 0,
      year3Value: 0,
      year3Percent: 0,
    },
    {
      label: "- Materialeinsatz/Wareneinsatz",
      year1Value: 0,
      year1Percent: 0,
      year2Value: 0,
      year2Percent: 0,
      year3Value: 0,
      year3Percent: 0,
    },
    {
      label: "= Rohgewinn I",
      year1Value: summaries[0].totalRevenue,
      year1Percent: 100,
      year2Value: summaries[1].totalRevenue,
      year2Percent: 100,
      year3Value: summaries[2].totalRevenue,
      year3Percent: 100,
    },
    // Personnel
    {
      label: "- Personalkosten",
      year1Value: -yearlyDetails[0].personnel,
      year1Percent: percentOfRevenue(yearlyDetails[0].personnel, summaries[0].totalRevenue),
      year2Value: -yearlyDetails[1].personnel,
      year2Percent: percentOfRevenue(yearlyDetails[1].personnel, summaries[1].totalRevenue),
      year3Value: -yearlyDetails[2].personnel,
      year3Percent: percentOfRevenue(yearlyDetails[2].personnel, summaries[2].totalRevenue),
    },
    {
      label: "= Rohgewinn II",
      year1Value: summaries[0].grossProfit,
      year1Percent: percentOfRevenue(summaries[0].grossProfit, summaries[0].totalRevenue),
      year2Value: summaries[1].grossProfit,
      year2Percent: percentOfRevenue(summaries[1].grossProfit, summaries[1].totalRevenue),
      year3Value: summaries[2].grossProfit,
      year3Percent: percentOfRevenue(summaries[2].grossProfit, summaries[2].totalRevenue),
    },
    // Operating costs
    {
      label: "- Betriebskosten",
      year1Value: -yearlyDetails[0].operating,
      year1Percent: percentOfRevenue(yearlyDetails[0].operating, summaries[0].totalRevenue),
      year2Value: -yearlyDetails[1].operating,
      year2Percent: percentOfRevenue(yearlyDetails[1].operating, summaries[1].totalRevenue),
      year3Value: -yearlyDetails[2].operating,
      year3Percent: percentOfRevenue(yearlyDetails[2].operating, summaries[2].totalRevenue),
    },
    {
      label: "- Investitionen",
      year1Value: -yearlyDetails[0].investment,
      year1Percent: percentOfRevenue(yearlyDetails[0].investment, summaries[0].totalRevenue),
      year2Value: -yearlyDetails[1].investment,
      year2Percent: percentOfRevenue(yearlyDetails[1].investment, summaries[1].totalRevenue),
      year3Value: -yearlyDetails[2].investment,
      year3Percent: percentOfRevenue(yearlyDetails[2].investment, summaries[2].totalRevenue),
    },
    // EBIT / Cash-flow
    {
      label: "= Erweiterter Cash-flow",
      year1Value: summaries[0].operatingProfit - yearlyDetails[0].investment,
      year1Percent: percentOfRevenue(
        summaries[0].operatingProfit - yearlyDetails[0].investment,
        summaries[0].totalRevenue
      ),
      year2Value: summaries[1].operatingProfit - yearlyDetails[1].investment,
      year2Percent: percentOfRevenue(
        summaries[1].operatingProfit - yearlyDetails[1].investment,
        summaries[1].totalRevenue
      ),
      year3Value: summaries[2].operatingProfit - yearlyDetails[2].investment,
      year3Percent: percentOfRevenue(
        summaries[2].operatingProfit - yearlyDetails[2].investment,
        summaries[2].totalRevenue
      ),
    },
    {
      label: "- Zinsen",
      year1Value: -yearlyDetails[0].interest,
      year1Percent: percentOfRevenue(yearlyDetails[0].interest, summaries[0].totalRevenue),
      year2Value: -yearlyDetails[1].interest,
      year2Percent: percentOfRevenue(yearlyDetails[1].interest, summaries[1].totalRevenue),
      year3Value: -yearlyDetails[2].interest,
      year3Percent: percentOfRevenue(yearlyDetails[2].interest, summaries[2].totalRevenue),
    },
    {
      label: "= Cash-flow",
      year1Value: summaries[0].operatingProfit - yearlyDetails[0].investment - yearlyDetails[0].interest,
      year1Percent: percentOfRevenue(
        summaries[0].operatingProfit - yearlyDetails[0].investment - yearlyDetails[0].interest,
        summaries[0].totalRevenue
      ),
      year2Value: summaries[1].operatingProfit - yearlyDetails[1].investment - yearlyDetails[1].interest,
      year2Percent: percentOfRevenue(
        summaries[1].operatingProfit - yearlyDetails[1].investment - yearlyDetails[1].interest,
        summaries[1].totalRevenue
      ),
      year3Value: summaries[2].operatingProfit - yearlyDetails[2].investment - yearlyDetails[2].interest,
      year3Percent: percentOfRevenue(
        summaries[2].operatingProfit - yearlyDetails[2].investment - yearlyDetails[2].interest,
        summaries[2].totalRevenue
      ),
    },
    // Results
    {
      label: "= Betriebsergebnis (vor Steuern)",
      year1Value: summaries[0].profitBeforeTax,
      year1Percent: percentOfRevenue(summaries[0].profitBeforeTax, summaries[0].totalRevenue),
      year2Value: summaries[1].profitBeforeTax,
      year2Percent: percentOfRevenue(summaries[1].profitBeforeTax, summaries[1].totalRevenue),
      year3Value: summaries[2].profitBeforeTax,
      year3Percent: percentOfRevenue(summaries[2].profitBeforeTax, summaries[2].totalRevenue),
    },
    {
      label: "- Steuern (geschätzt)",
      year1Value: -summaries[0].totalTaxes,
      year1Percent: percentOfRevenue(summaries[0].totalTaxes, summaries[0].totalRevenue),
      year2Value: -summaries[1].totalTaxes,
      year2Percent: percentOfRevenue(summaries[1].totalTaxes, summaries[1].totalRevenue),
      year3Value: -summaries[2].totalTaxes,
      year3Percent: percentOfRevenue(summaries[2].totalTaxes, summaries[2].totalRevenue),
    },
    {
      label: "= Betriebsgewinn (nach Steuern)",
      year1Value: summaries[0].netProfit,
      year1Percent: percentOfRevenue(summaries[0].netProfit, summaries[0].totalRevenue),
      year2Value: summaries[1].netProfit,
      year2Percent: percentOfRevenue(summaries[1].netProfit, summaries[1].totalRevenue),
      year3Value: summaries[2].netProfit,
      year3Percent: percentOfRevenue(summaries[2].netProfit, summaries[2].totalRevenue),
    },
    // UG Reserve
    {
      label: "- UG Rücklage (25%)",
      year1Value: -summaries[0].ugReserve,
      year1Percent: percentOfRevenue(summaries[0].ugReserve, summaries[0].totalRevenue),
      year2Value: -summaries[1].ugReserve,
      year2Percent: percentOfRevenue(summaries[1].ugReserve, summaries[1].totalRevenue),
      year3Value: -summaries[2].ugReserve,
      year3Percent: percentOfRevenue(summaries[2].ugReserve, summaries[2].totalRevenue),
    },
    {
      label: "= Ausschüttungsfähiger Gewinn",
      year1Value: summaries[0].netProfit - summaries[0].ugReserve,
      year1Percent: percentOfRevenue(
        summaries[0].netProfit - summaries[0].ugReserve,
        summaries[0].totalRevenue
      ),
      year2Value: summaries[1].netProfit - summaries[1].ugReserve,
      year2Percent: percentOfRevenue(
        summaries[1].netProfit - summaries[1].ugReserve,
        summaries[1].totalRevenue
      ),
      year3Value: summaries[2].netProfit - summaries[2].ugReserve,
      year3Percent: percentOfRevenue(
        summaries[2].netProfit - summaries[2].ugReserve,
        summaries[2].totalRevenue
      ),
    },
  ];

  return {
    companyName,
    years,
    rows,
  };
}

/**
 * Format BWA value for display
 */
export function formatBWAValue(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)} %`;
}
