import { z } from "zod";

// Step 1: Company Setup Schema
export const companySchema = z.object({
  companyName: z.string().min(2, "Der Firmenname muss mindestens 2 Zeichen lang sein"),
  foundingDate: z.string().min(1, "Bitte geben Sie das Gründungsdatum ein"),
  stammkapital: z.number().min(1, "Das Stammkapital muss mindestens 1€ betragen"),
  hebesatz: z.number().min(200).max(900, "Der Hebesatz muss zwischen 200 und 900 liegen"),
  kontokorrent: z.number().min(0, "Der Kontokorrent darf nicht negativ sein"),
});

export const planSchema = z.object({
  name: z.string().min(2, "Der Planname muss mindestens 2 Zeichen lang sein"),
  startYear: z.number().min(2020).max(2050),
  startingLiquidity: z.number().min(0, "Die Anfangsliquidität darf nicht negativ sein"),
});

// Step 2: Revenue Schema
export const revenueSchema = z.object({
  revenueModel: z.enum(["fixed", "growth", "custom"]),
  fixedMonthlyRevenue: z.number().min(0).optional(),
  growthStartRevenue: z.number().min(0).optional(),
  growthEndRevenue: z.number().min(0).optional(),
  months: z.record(z.string(), z.object({
    unitPrice: z.number().min(0),
    unitsSold: z.number().min(0),
    total: z.number().min(0),
  })).optional(),
});

// Step 3: Personnel Schema
export const employeeSchema = z.object({
  id: z.string(),
  role: z.string().min(1, "Bitte geben Sie eine Rolle ein"),
  monthlySalary: z.number().min(0, "Das Gehalt darf nicht negativ sein"),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, "Ungültiges Datumsformat"),
  endMonth: z.string().regex(/^\d{4}-\d{2}$/, "Ungültiges Datumsformat").optional(),
  isGeschaeftsfuehrer: z.boolean(),
});

export const personnelSchema = z.object({
  employees: z.array(employeeSchema),
});

// Step 4: Operating Costs Schema
export const operatingCostsSchema = z.object({
  categories: z.object({
    rent: z.number().min(0, "Die Miete darf nicht negativ sein"),
    marketing: z.number().min(0, "Die Marketingkosten dürfen nicht negativ sein"),
    insurance: z.number().min(0, "Die Versicherungskosten dürfen nicht negativ sein"),
    software: z.number().min(0, "Die Softwarekosten dürfen nicht negativ sein"),
    legal: z.number().min(0, "Die Rechtskosten dürfen nicht negativ sein"),
    accounting: z.number().min(0, "Die Buchhaltungskosten dürfen nicht negativ sein"),
    other: z.number().min(0, "Die sonstigen Kosten dürfen nicht negativ sein"),
  }),
});

// Step 5: Investments Schema
export const investmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Bitte geben Sie einen Namen ein"),
  amount: z.number().min(0, "Der Betrag darf nicht negativ sein"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Ungültiges Datumsformat"),
  category: z.enum(["equipment", "software", "furniture", "vehicles", "other"]),
});

export const investmentsSchema = z.object({
  items: z.array(investmentSchema),
});

// Step 6: Loans Schema
export const loanSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Bitte geben Sie einen Namen ein"),
  amount: z.number().min(0, "Der Betrag darf nicht negativ sein"),
  interestRate: z.number().min(0).max(1, "Der Zinssatz muss zwischen 0 und 100% liegen"),
  termMonths: z.number().min(1, "Die Laufzeit muss mindestens 1 Monat betragen"),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, "Ungültiges Datumsformat"),
  gracePeriodMonths: z.number().min(0, "Die tilgungsfreie Zeit darf nicht negativ sein"),
  provisionFee: z.number().min(0).optional(),
});

export const loansSchema = z.object({
  loans: z.array(loanSchema),
});

// Type exports
export type CompanyFormData = z.infer<typeof companySchema>;
export type PlanFormData = z.infer<typeof planSchema>;
export type RevenueFormData = z.infer<typeof revenueSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type PersonnelFormData = z.infer<typeof personnelSchema>;
export type OperatingCostsFormData = z.infer<typeof operatingCostsSchema>;
export type InvestmentFormData = z.infer<typeof investmentSchema>;
export type InvestmentsFormData = z.infer<typeof investmentsSchema>;
export type LoanFormData = z.infer<typeof loanSchema>;
export type LoansFormData = z.infer<typeof loansSchema>;
