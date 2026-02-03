"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { BWAData } from "@/lib/types";

// Register a font that supports German characters
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  companyInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    fontWeight: "bold",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 6,
  },
  tableRowHighlight: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 6,
    backgroundColor: "#f9f9f9",
    fontWeight: "bold",
  },
  labelCell: {
    width: "28%",
  },
  valueCell: {
    width: "12%",
    textAlign: "right",
  },
  percentCell: {
    width: "12%",
    textAlign: "right",
    color: "#666",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
  note: {
    marginTop: 20,
    fontSize: 8,
    color: "#666",
    fontStyle: "italic",
  },
});

interface BWAPdfProps {
  data: BWAData;
}

export function BWAPdf({ data }: BWAPdfProps) {
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)} %`;
  };

  const isHighlightRow = (label: string): boolean => {
    return label.startsWith("=") || label.includes("Rohgewinn") || label.includes("Cash-flow");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rentabilitaetsvorschau</Text>
          <Text style={styles.subtitle}>Betriebswirtschaftliche Auswertung (BWA)</Text>
        </View>

        {/* Company Info */}
        <View style={styles.companyInfo}>
          <Text>Kreditnehmer: {data.companyName}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <Text style={styles.labelCell}></Text>
            <Text style={styles.valueCell}>Jahr {data.years[0]}</Text>
            <Text style={styles.percentCell}>% Umsatz</Text>
            <Text style={styles.valueCell}>Jahr {data.years[1]}</Text>
            <Text style={styles.percentCell}>% Umsatz</Text>
            <Text style={styles.valueCell}>Jahr {data.years[2]}</Text>
            <Text style={styles.percentCell}>% Umsatz</Text>
          </View>

          {/* Data Rows */}
          {data.rows.map((row, index) => (
            <View
              key={index}
              style={isHighlightRow(row.label) ? styles.tableRowHighlight : styles.tableRow}
            >
              <Text style={styles.labelCell}>{row.label}</Text>
              <Text style={styles.valueCell}>{formatNumber(row.year1Value)}</Text>
              <Text style={styles.percentCell}>{formatPercent(row.year1Percent)}</Text>
              <Text style={styles.valueCell}>{formatNumber(row.year2Value)}</Text>
              <Text style={styles.percentCell}>{formatPercent(row.year2Percent)}</Text>
              <Text style={styles.valueCell}>{formatNumber(row.year3Value)}</Text>
              <Text style={styles.percentCell}>{formatPercent(row.year3Percent)}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.note}>
          <Text>Alle Werte sind ohne Mehrwertsteuer einzutragen.</Text>
          <Text>Die Steuerberechnung ist hier ein Richtwert.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Erstellt mit FounderFlow | {new Date().toLocaleDateString("de-DE")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
