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
  updateInvestments: (data: Partial<InvestmentsData>) => void;
  addInvestment: (investment: Investment) => void;
  removeInvestment: (id: string) => void;
  updateLoans: (data: Partial<LoansData>) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (id: string, data: Partial<Loan>) => void;
  removeLoan: (id: string) => void;
  reset: () => void;
}

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
    categories: {
      rent: 200,
      telephoneInternet: 10,
      travelCosts: 150,
      insurance: 20,
      marketing: 350,
      softwareLicenses: 25,
      accounting: 0,
      officeSupplies: 0,
      chamberFees: 0,
      other: 0,
    },
    monthlyOverrides: {},
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
        set((state) => {
          const newCategories = {
            rent: data.categories?.rent ?? state.operatingCosts.categories?.rent ?? 200,
            telephoneInternet: data.categories?.telephoneInternet ?? state.operatingCosts.categories?.telephoneInternet ?? 10,
            travelCosts: data.categories?.travelCosts ?? state.operatingCosts.categories?.travelCosts ?? 150,
            insurance: data.categories?.insurance ?? state.operatingCosts.categories?.insurance ?? 20,
            marketing: data.categories?.marketing ?? state.operatingCosts.categories?.marketing ?? 350,
            softwareLicenses: data.categories?.softwareLicenses ?? state.operatingCosts.categories?.softwareLicenses ?? 25,
            accounting: data.categories?.accounting ?? state.operatingCosts.categories?.accounting ?? 0,
            officeSupplies: data.categories?.officeSupplies ?? state.operatingCosts.categories?.officeSupplies ?? 0,
            chamberFees: data.categories?.chamberFees ?? state.operatingCosts.categories?.chamberFees ?? 0,
            other: data.categories?.other ?? state.operatingCosts.categories?.other ?? 0,
          };
          return {
            operatingCosts: {
              ...state.operatingCosts,
              ...data,
              categories: newCategories,
            },
          };
        }),

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
    }),
    {
      name: "founderflow-wizard",
    }
  )
);
