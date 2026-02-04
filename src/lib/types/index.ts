import { Timestamp } from "firebase/firestore";

// User Types
export interface UserData {
  email: string;
  displayName: string;
  createdAt: Timestamp;
}

// Company Types
export interface Company {
  id?: string;
  userId: string;
  companyName: string;
  foundingDate: string; // ISO date string
  stammkapital: number; // Starting capital (min €1 for UG)
  hebesatz: number; // Municipal trade tax rate (e.g., 410)
  kontokorrent: number; // Overdraft limit
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Plan Types
export interface Plan {
  id?: string;
  companyId: string;
  name: string;
  startYear: number;
  startingLiquidity: number;
  status: "draft" | "final";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Revenue Types
export interface MonthlyRevenue {
  unitPrice: number;
  unitsSold: number;
  total: number;
}

export interface RevenueData {
  planId: string;
  revenueModel: "fixed" | "growth" | "custom";
  fixedMonthlyRevenue?: number;
  growthStartRevenue?: number;
  growthEndRevenue?: number;
  months: Record<string, MonthlyRevenue>; // "2026-01" => data
}

// Personnel Types
export interface Employee {
  id: string;
  role: string;
  monthlySalary: number;
  startMonth: string; // "2026-01"
  endMonth?: string;
  isGeschaeftsfuehrer: boolean;
}

export interface PersonnelData {
  planId: string;
  employees: Employee[];
}

// Operating Cost Item (dynamic - user can add/remove)
export interface OperatingCostItem {
  id: string;
  name: string; // e.g., "Miete", "Materialkosten", custom names
  amount: number; // Monthly amount in €
  category?: string; // Optional category for grouping
  description?: string; // Optional description
}

// Default expense categories (for suggestions/templates)
export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: "rent", name: "Miete", nameEn: "Rent", nameFa: "اجاره", defaultAmount: 200 },
  { id: "telephoneInternet", name: "Telefon & Internet", nameEn: "Phone & Internet", nameFa: "تلفن و اینترنت", defaultAmount: 50 },
  { id: "travelCosts", name: "Fahrt-/Reisekosten", nameEn: "Travel Costs", nameFa: "هزینه سفر", defaultAmount: 150 },
  { id: "insurance", name: "Versicherungen", nameEn: "Insurance", nameFa: "بیمه", defaultAmount: 50 },
  { id: "marketing", name: "Marketing", nameEn: "Marketing", nameFa: "بازاریابی", defaultAmount: 200 },
  { id: "softwareLicenses", name: "Software Lizenzen", nameEn: "Software Licenses", nameFa: "مجوز نرم‌افزار", defaultAmount: 100 },
  { id: "accounting", name: "Steuerberater", nameEn: "Accountant", nameFa: "حسابدار", defaultAmount: 150 },
  { id: "officeSupplies", name: "Büromaterial", nameEn: "Office Supplies", nameFa: "لوازم اداری", defaultAmount: 30 },
  { id: "chamberFees", name: "IHK Beiträge", nameEn: "Chamber Fees", nameFa: "حق عضویت اتاق", defaultAmount: 20 },
] as const;

// Legacy fixed categories interface (kept for backward compatibility)
export interface OperatingCostCategories {
  rent: number;
  telephoneInternet: number;
  travelCosts: number;
  insurance: number;
  marketing: number;
  softwareLicenses: number;
  accounting: number;
  officeSupplies: number;
  chamberFees: number;
  other: number;
}

// VAT (Umsatzsteuer) Configuration
export interface VATConfig {
  isSmallBusiness: boolean; // Kleinunternehmerregelung (§19 UStG)
  vatRate: number; // Standard 19%, reduced 7%
  vatPaymentPeriod: "monthly" | "quarterly"; // Voranmeldungszeitraum
}

export interface OperatingCostsData {
  planId: string;
  // New dynamic items array
  items: OperatingCostItem[];
  // Legacy categories (for backward compatibility)
  categories?: OperatingCostCategories;
  monthlyOverrides?: Record<string, Partial<OperatingCostCategories>>;
}

// Investment Types
export interface Investment {
  id: string;
  name: string;
  amount: number;
  month: string; // "2026-01"
  category: "equipment" | "software" | "furniture" | "vehicles" | "other";
}

export interface InvestmentsData {
  planId: string;
  items: Investment[];
}

// Loan Types
export interface Loan {
  id: string;
  name: string;
  amount: number;
  interestRate: number; // Annual rate as decimal (0.035 = 3.5%)
  termMonths: number;
  startMonth: string; // "2026-01"
  gracePeriodMonths: number; // Tilgungsfreie Zeit
  provisionFee?: number; // Bereitstellungsentgelt
  bankProvisionRate?: number; // Bank provision rate (e.g., 0.015 = 1.5%)
}

export interface LoansData {
  planId: string;
  loans: Loan[];
}

// Calculated Data Types
export interface MonthlyCalculation {
  month: string;
  // Inflows
  revenue: number;
  revenueGross: number; // Including VAT
  otherIncome: number;
  totalInflows: number;
  // Outflows
  personnelCosts: number;
  operatingCosts: number;
  operatingCostsBreakdown: Record<string, number>; // Dynamic breakdown: { "Miete": 500, "Marketing": 200, ... }
  investmentCosts: number;
  loanInterest: number;
  loanPrincipal: number;
  totalOutflows: number;
  // Balance
  netCashflow: number;
  startBalance: number;
  endBalance: number;
  // Tax estimates (annual, prorated)
  koerperschaftsteuer: number;
  gewerbesteuer: number;
  solidaritaetszuschlag: number;
  // VAT (Umsatzsteuer)
  vatCollected: number; // Eingenommene Umsatzsteuer
  vatPaid: number; // Gezahlte Vorsteuer
  vatPayable: number; // Umsatzsteuerzahllast
  // Loan tracking
  loanRemainingBalance: number;
}

export interface YearSummary {
  year: number;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  operatingProfit: number;
  profitBeforeTax: number;
  totalTaxes: number;
  netProfit: number;
  endLiquidity: number;
  ugReserve: number;
}

export interface CalculatedData {
  planId: string;
  months: Record<string, MonthlyCalculation>;
  yearSummaries: Record<number, YearSummary>;
  calculatedAt: Timestamp;
}

// BWA (Betriebswirtschaftliche Auswertung) Types
export interface BWARow {
  label: string;
  year1Value: number;
  year1Percent: number;
  year2Value: number;
  year2Percent: number;
  year3Value: number;
  year3Percent: number;
}

export interface BWAData {
  companyName: string;
  years: [number, number, number];
  rows: BWARow[];
}

// Form State Types (for wizard)
export interface WizardState {
  currentStep: number;
  company: Partial<Company>;
  revenue: Partial<RevenueData>;
  personnel: Partial<PersonnelData>;
  operatingCosts: Partial<OperatingCostsData>;
  investments: Partial<InvestmentsData>;
  loans: Partial<LoansData>;
}

// German Cities with Hebesatz
export interface CityHebesatz {
  city: string;
  state: string;
  hebesatz: number;
}
