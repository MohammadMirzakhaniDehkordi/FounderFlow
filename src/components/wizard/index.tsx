"use client";

import { useWizardStore } from "@/lib/store/wizardStore";
import { CompanyStep } from "./steps/CompanyStep";
import { RevenueStep } from "./steps/RevenueStep";
import { PersonnelStep } from "./steps/PersonnelStep";
import { OperatingCostsStep } from "./steps/OperatingCostsStep";
import { InvestmentsStep } from "./steps/InvestmentsStep";
import { LoansStep } from "./steps/LoansStep";
import { ReviewStep } from "./steps/ReviewStep";

const STEPS = [
  CompanyStep,
  RevenueStep,
  PersonnelStep,
  OperatingCostsStep,
  InvestmentsStep,
  LoansStep,
  ReviewStep,
];

export function Wizard() {
  const { currentStep } = useWizardStore();
  const StepComponent = STEPS[currentStep];

  return <StepComponent />;
}

export { WizardLayout } from "./WizardLayout";
