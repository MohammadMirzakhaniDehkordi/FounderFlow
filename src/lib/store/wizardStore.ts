import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Company,
  RevenueData,
  PersonnelData,
  OperatingCostsData,
  InvestmentsData,
  LoansData,
  Employee,
  Investment,
  Loan,
  OperatingCostItem,
} from "../types";

export interface WizardState {
  currentStep: number;
  companyId: string | null;
  planId: string | null;

  // Step data
  company: Partial<Company>;
  plan: {
    name: string;
    startYear: number;
    startingLiquidity: number;
  };
  revenue: Partial<RevenueData>;
  personnel: Partial<PersonnelData>;
  operatingCosts: Partial<OperatingCostsData>;
  investments: Partial<InvestmentsData>;
  loans: Partial<LoansData>;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCompanyId: (id: string) => void;
  setPlanId: (id: string) => void;
  updateCompany: (data: Partial<Company>) => void;
  updatePlan: (data: Partial<WizardState["plan"]>) => void;
  updateRevenue: (data: Partial<RevenueData>) => void;
  updatePersonnel: (data: Partial<PersonnelData>) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  updateOperatingCosts: (data: Partial<OperatingCostsData>) => void;
  // New: Dynamic expense item actions
  addExpenseItem: (item: OperatingCostItem) => void;
  updateExpenseItem: (id: string, data: Partial<OperatingCostItem>) => void;
  removeExpenseItem: (id: string) => void;
  updateInvestments: (data: Partial<InvestmentsData>) => void;
  addInvestment: (investment: Investment) => void;
  removeInvestment: (id: string) => void;
  updateLoans: (data: Partial<LoansData>) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (id: string, data: Partial<Loan>) => void;
  removeLoan: (id: string) => void;
  reset: () => void;
  // Load all data (for Firestore integration)
  loadAllData: (data: Partial<WizardState>) => void;
}

// Default expense items for new plans
const defaultExpenseItems: OperatingCostItem[] = [
  { id: "rent", name: "Miete", amount: 200, description: "Büro, Coworking, Lager" },
  { id: "telephoneInternet", name: "Telefon & Internet", amount: 50, description: "Festnetz, Mobil, DSL" },
  { id: "travelCosts", name: "Fahrt-/Reisekosten", amount: 150, description: "PKW, Benzin, Leasing" },
  { id: "insurance", name: "Versicherungen", amount: 50, description: "Betriebshaftpflicht, etc." },
  { id: "marketing", name: "Marketing", amount: 200, description: "Web, Social Media, Werbung" },
  { id: "softwareLicenses", name: "Software Lizenzen", amount: 100, description: "Zoom, Microsoft, SaaS" },
  { id: "accounting", name: "Steuerberater", amount: 150, description: "Buchhaltung, DATEV" },
];

const initialState = {
  currentStep: 0,
  companyId: null,
  planId: null,
  company: {
    companyName: "",
    stammkapital: 1,
    hebesatz: 400,
    kontokorrent: 0,
  },
  plan: {
    name: "",
    startYear: new Date().getFullYear(),
    startingLiquidity: 0,
  },
  revenue: {
    revenueModel: "fixed" as const,
    fixedMonthlyRevenue: 0,
    months: {},
  },
  personnel: {
    employees: [],
  },
  operatingCosts: {
    items: defaultExpenseItems,
  },
  investments: {
    items: [],
  },
  loans: {
    loans: [],
  },
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

      setCompanyId: (id) => set({ companyId: id }),
      setPlanId: (id) => set({ planId: id }),

      updateCompany: (data) =>
        set((state) => ({
          company: { ...state.company, ...data },
        })),

      updatePlan: (data) =>
        set((state) => ({
          plan: { ...state.plan, ...data },
        })),

      updateRevenue: (data) =>
        set((state) => ({
          revenue: { ...state.revenue, ...data },
        })),

      updatePersonnel: (data) =>
        set((state) => ({
          personnel: { ...state.personnel, ...data },
        })),

      addEmployee: (employee) =>
        set((state) => ({
          personnel: {
            ...state.personnel,
            employees: [...(state.personnel.employees || []), employee],
          },
        })),

      updateEmployee: (id, data) =>
        set((state) => ({
          personnel: {
            ...state.personnel,
            employees: (state.personnel.employees || []).map((emp) =>
              emp.id === id ? { ...emp, ...data } : emp
            ),
          },
        })),

      removeEmployee: (id) =>
        set((state) => ({
          personnel: {
            ...state.personnel,
            employees: (state.personnel.employees || []).filter((emp) => emp.id !== id),
          },
        })),

      updateOperatingCosts: (data) =>
        set((state) => ({
          operatingCosts: {
            ...state.operatingCosts,
            ...data,
          },
        })),

      addExpenseItem: (item) =>
        set((state) => ({
          operatingCosts: {
            ...state.operatingCosts,
            items: [...(state.operatingCosts.items || []), item],
          },
        })),

      updateExpenseItem: (id, data) =>
        set((state) => ({
          operatingCosts: {
            ...state.operatingCosts,
            items: (state.operatingCosts.items || []).map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          },
        })),

      removeExpenseItem: (id) =>
        set((state) => ({
          operatingCosts: {
            ...state.operatingCosts,
            items: (state.operatingCosts.items || []).filter((item) => item.id !== id),
          },
        })),

      updateInvestments: (data) =>
        set((state) => ({
          investments: { ...state.investments, ...data },
        })),

      addInvestment: (investment) =>
        set((state) => ({
          investments: {
            ...state.investments,
            items: [...(state.investments.items || []), investment],
          },
        })),

      removeInvestment: (id) =>
        set((state) => ({
          investments: {
            ...state.investments,
            items: (state.investments.items || []).filter((item) => item.id !== id),
          },
        })),

      updateLoans: (data) =>
        set((state) => ({
          loans: { ...state.loans, ...data },
        })),

      addLoan: (loan) =>
        set((state) => ({
          loans: {
            ...state.loans,
            loans: [...(state.loans.loans || []), loan],
          },
        })),

      updateLoan: (id, data) =>
        set((state) => ({
          loans: {
            ...state.loans,
            loans: (state.loans.loans || []).map((loan) =>
              loan.id === id ? { ...loan, ...data } : loan
            ),
          },
        })),

      removeLoan: (id) =>
        set((state) => ({
          loans: {
            ...state.loans,
            loans: (state.loans.loans || []).filter((loan) => loan.id !== id),
          },
        })),

      reset: () => set(initialState),

      // Load all data at once (for Firestore integration)
      loadAllData: (data) =>
        set((state) => ({
          ...state,
          ...data,
          company: { ...state.company, ...data.company },
          plan: { ...state.plan, ...data.plan },
          revenue: { ...state.revenue, ...data.revenue },
          personnel: { ...state.personnel, ...data.personnel },
          operatingCosts: { ...state.operatingCosts, ...data.operatingCosts },
          investments: { ...state.investments, ...data.investments },
          loans: { ...state.loans, ...data.loans },
        })),
    }),
    {
      name: "founderflow-wizard",
    }
  )
);
