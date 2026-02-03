"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useWizardStore } from "@/lib/store/wizardStore";

const STEPS = [
  { title: "Firma", description: "Grunddaten Ihrer UG" },
  { title: "Umsatz", description: "Umsatzplanung" },
  { title: "Personal", description: "Mitarbeiter & Gehälter" },
  { title: "Betriebskosten", description: "Laufende Kosten" },
  { title: "Investitionen", description: "Einmalige Ausgaben" },
  { title: "Finanzierung", description: "Darlehen & Kredite" },
  { title: "Übersicht", description: "Zusammenfassung" },
];

interface WizardLayoutProps {
  children: ReactNode;
  onNext?: () => void | Promise<void>;
  onPrev?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function WizardLayout({
  children,
  onNext,
  onPrev,
  nextLabel = "Weiter",
  nextDisabled = false,
  showBack = true,
}: WizardLayoutProps) {
  const { currentStep, nextStep, prevStep } = useWizardStore();
  const progress = ((currentStep + 1) / STEPS.length) * 100;

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
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Schritt {currentStep + 1} von {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% abgeschlossen
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step indicators */}
        <div className="hidden md:flex justify-between mb-8">
          {STEPS.map((step, index) => (
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
              <span className="text-xs mt-1 hidden lg:block">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep].title}</CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
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
            Zurück
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={nextDisabled}>
              {nextLabel}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={nextDisabled}>
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
