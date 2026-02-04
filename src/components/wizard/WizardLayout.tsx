"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { useWizardStore } from "@/lib/store/wizardStore";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const STEP_KEYS = [
  { titleKey: "wizard.steps.company", descKey: "wizard.steps.companyDesc" },
  { titleKey: "wizard.steps.revenue", descKey: "wizard.steps.revenueDesc" },
  { titleKey: "wizard.steps.personnel", descKey: "wizard.steps.personnelDesc" },
  { titleKey: "wizard.steps.operatingCosts", descKey: "wizard.steps.operatingCostsDesc" },
  { titleKey: "wizard.steps.investments", descKey: "wizard.steps.investmentsDesc" },
  { titleKey: "wizard.steps.loans", descKey: "wizard.steps.loansDesc" },
  { titleKey: "wizard.steps.review", descKey: "wizard.steps.reviewDesc" },
];

interface WizardLayoutProps {
  children: ReactNode;
  onNext?: () => void | Promise<void>;
  onPrev?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  isLoading?: boolean;
}

export function WizardLayout({
  children,
  onNext,
  onPrev,
  nextLabel,
  nextDisabled = false,
  showBack = true,
  isLoading = false,
}: WizardLayoutProps) {
  const { t } = useTranslation();
  const { currentStep, nextStep, prevStep } = useWizardStore();
  const progress = ((currentStep + 1) / STEP_KEYS.length) * 100;
  const defaultNextLabel = t("common.next");

  const handleNext = async () => {
    if (onNext) {
      await onNext();
    }
    nextStep();
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    }
    prevStep();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {t("wizard.step")} {currentStep + 1} {t("wizard.of")} {STEP_KEYS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% {t("wizard.completed")}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step indicators */}
        <div className="hidden md:flex justify-between mb-8">
          {STEP_KEYS.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center",
                index <= currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary text-primary"
                    : "border-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs mt-1 hidden lg:block">{t(step.titleKey)}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>{t(STEP_KEYS[currentStep].titleKey)}</CardTitle>
            <CardDescription>{t(STEP_KEYS[currentStep].descKey)}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0 || !showBack}
            className={cn(currentStep === 0 && "invisible")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("wizard.back")}
          </Button>

          {currentStep < STEP_KEYS.length - 1 ? (
            <Button onClick={handleNext} disabled={nextDisabled || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {nextLabel ?? defaultNextLabel}
              {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={nextDisabled || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {nextLabel ?? defaultNextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
