"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { MonthlyCalculation, YearSummary } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 15,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  yearSection: {
    marginBottom: 20,
  },
  yearTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    padding: 5,
  },
  summaryBox: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 7,
    color: "#666",
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    fontWeight: "bold",
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    padding: 3,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    padding: 3,
    backgroundColor: "#fafafa",
  },
  labelCell: {
    width: "20%",
    fontSize: 7,
  },
  monthCell: {
    width: "6.15%",
    textAlign: "right",
    fontSize: 7,
  },
  sumCell: {
    width: "8%",
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 7,
  },
  positiveValue: {
    color: "#16a34a",
  },
  negativeValue: {
    color: "#dc2626",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 7,
    color: "#666",
    textAlign: "center",
  },
});

interface LiquidityPdfProps {
  companyName: string;
  startYear: number;
  months: Record<string, MonthlyCalculation>;
  yearSummaries: Record<number, YearSummary>;
  startingLiquidity: number;
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export function LiquidityPdf({
  companyName,
  startYear,
  months,
  yearSummaries,
  startingLiquidity,
}: LiquidityPdfProps) {
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderYearTable = (year: number) => {
    const yearMonths = Object.entries(months).filter(([m]) => m.startsWith(`${year}-`));
    const summary = yearSummaries[year];
    const isFirstYear = year === startYear;
    const prevYearSummary = yearSummaries[year - 1];
    const yearStartLiquidity = isFirstYear
      ? startingLiquidity
      : prevYearSummary?.endLiquidity || 0;

    const rows = [
      {
        label: "1. Einzahlungen",
        getValue: (m: MonthlyCalculation) => m.revenue,
        isHeader: true,
      },
      {
        label: "   Umsatz",
        getValue: (m: MonthlyCalculation) => m.revenue,
      },
      {
        label: "2. Auszahlungen",
        getValue: (m: MonthlyCalculation) => m.totalOutflows,
        isHeader: true,
      },
      {
        label: "   Personalkosten",
        getValue: (m: MonthlyCalculation) => m.personnelCosts,
      },
      {
        label: "   Betriebskosten",
        getValue: (m: MonthlyCalculation) => m.operatingCosts,
      },
      {
        label: "   Investitionen",
        getValue: (m: MonthlyCalculation) => m.investmentCosts,
      },
      {
        label: "   Kreditzinsen",
        getValue: (m: MonthlyCalculation) => m.loanInterest,
      },
      {
        label: "   Kredittilgung",
        getValue: (m: MonthlyCalculation) => m.loanPrincipal,
      },
      {
        label: "3. Saldo",
        getValue: (m: MonthlyCalculation) => m.netCashflow,
        isHighlight: true,
      },
      {
        label: "4. Kontostand",
        getValue: (m: MonthlyCalculation) => m.endBalance,
        isHighlight: true,
      },
    ];

    return (
      <View style={styles.yearSection} key={year}>
        <Text style={styles.yearTitle}>
          Liquiditaetsplan Jahr {year} - {companyName}
        </Text>

        {/* Summary Box */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Anfangsbestand</Text>
            <Text style={styles.summaryValue}>{formatNumber(yearStartLiquidity)} EUR</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Umsatz</Text>
            <Text style={styles.summaryValue}>{formatNumber(summary?.totalRevenue || 0)} EUR</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Kosten</Text>
            <Text style={styles.summaryValue}>{formatNumber(summary?.totalCosts || 0)} EUR</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Endbestand</Text>
            <Text style={styles.summaryValue}>{formatNumber(summary?.endLiquidity || 0)} EUR</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.labelCell}>Position</Text>
            {MONTHS_SHORT.map((m, i) => (
              <Text key={i} style={styles.monthCell}>{m}</Text>
            ))}
            <Text style={styles.sumCell}>Summe</Text>
          </View>

          {/* Rows */}
          {rows.map((row, rowIndex) => {
            const yearTotal = yearMonths.reduce((sum, [, m]) => sum + row.getValue(m), 0);

            return (
              <View
                key={rowIndex}
                style={row.isHeader ? styles.tableRowAlt : styles.tableRow}
              >
                <Text style={row.isHeader ? [styles.labelCell, { fontWeight: "bold" }] : styles.labelCell}>
                  {row.label}
                </Text>
                {yearMonths.map(([, m], i) => {
                  const value = row.getValue(m);
                  const isNegative = value < 0;
                  const cellStyle = row.isHighlight
                    ? [styles.monthCell, isNegative ? styles.negativeValue : styles.positiveValue]
                    : styles.monthCell;
                  return (
                    <Text key={i} style={cellStyle}>
                      {formatNumber(value)}
                    </Text>
                  );
                })}
                <Text
                  style={
                    row.isHighlight
                      ? [styles.sumCell, yearTotal < 0 ? styles.negativeValue : styles.positiveValue]
                      : styles.sumCell
                  }
                >
                  {formatNumber(row.label === "4. Kontostand" ? summary?.endLiquidity || 0 : yearTotal)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Liquiditaetsplanung</Text>
          <Text style={styles.subtitle}>
            {companyName} | {startYear} - {startYear + 2}
          </Text>
        </View>

        {/* Year Tables */}
        {renderYearTable(startYear)}
      </Page>

      <Page size="A4" orientation="landscape" style={styles.page}>
        {renderYearTable(startYear + 1)}
      </Page>

      <Page size="A4" orientation="landscape" style={styles.page}>
        {renderYearTable(startYear + 2)}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Erstellt mit FounderFlow | {new Date().toLocaleDateString("de-DE")} | Alle Betraege in EUR
          </Text>
        </View>
      </Page>
    </Document>
  );
}
