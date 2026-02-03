"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WizardLayout } from "../WizardLayout";
import { useWizardStore } from "@/lib/store/wizardStore";
import { calculateMonthlyPayment, generateLoanSchedule } from "@/lib/calculations/loans";
import type { Loan } from "@/lib/types";
import { Plus, Trash2, Landmark, Info } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function LoansStep() {
  const { loans, plan, addLoan, removeLoan } = useWizardStore();
  const { t, locale } = useTranslation();
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";
  const [showForm, setShowForm] = useState(false);
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({
    name: "",
    amount: 0,
    interestRate: 0.035,
    termMonths: 60,
    startMonth: `${plan.startYear}-01`,
    gracePeriodMonths: 0,
    provisionFee: 0,
  });

  const loansList = loans.loans || [];

  const handleAddLoan = () => {
    if (!newLoan.name || !newLoan.amount) return;

    const loan: Loan = {
      id: crypto.randomUUID(),
      name: newLoan.name,
      amount: newLoan.amount,
      interestRate: newLoan.interestRate || 0.035,
      termMonths: newLoan.termMonths || 60,
      startMonth: newLoan.startMonth || `${plan.startYear}-01`,
      gracePeriodMonths: newLoan.gracePeriodMonths || 0,
      provisionFee: newLoan.provisionFee || 0,
    };

    addLoan(loan);
    setNewLoan({
      name: "",
      amount: 0,
      interestRate: 0.035,
      termMonths: 60,
      startMonth: `${plan.startYear}-01`,
      gracePeriodMonths: 0,
      provisionFee: 0,
    });
    setShowForm(false);
  };

  const totalLoanAmount = loansList.reduce((sum, loan) => sum + loan.amount, 0);

  const previewMonthlyPayment =
    newLoan.amount && newLoan.interestRate && newLoan.termMonths
      ? calculateMonthlyPayment(
          newLoan.amount,
          newLoan.interestRate,
          newLoan.termMonths - (newLoan.gracePeriodMonths || 0)
        )
      : 0;

  const formatCurrency = (value: number) => value.toLocaleString(numberLocale);

  return (
    <WizardLayout>
      <div className="space-y-6">
        <p className="text-muted-foreground">{t("wizard.loans.intro")}</p>

        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {t("wizard.loans.loanNoteTitle")}
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  {t("wizard.loans.loanNoteDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loansList.length > 0 && (
          <div className="space-y-3">
            {loansList.map((loan) => {
              const monthlyPayment = calculateMonthlyPayment(
                loan.amount,
                loan.interestRate,
                loan.termMonths - loan.gracePeriodMonths
              );
              const schedule = generateLoanSchedule(loan, loan.startMonth, loan.termMonths);

              return (
                <Card key={loan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Landmark className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{loan.name}</span>
                            {loan.gracePeriodMonths > 0 && (
                              <Badge variant="secondary">
                                {t("wizard.loans.gracePeriodMonths", {
                                  count: loan.gracePeriodMonths,
                                })}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                            <p>
                              {t("wizard.loans.loanDetails", {
                                amount: formatCurrency(loan.amount),
                                rate: (loan.interestRate * 100).toFixed(1),
                                months: loan.termMonths,
                              })}
                            </p>
                            <p>
                              {t("wizard.loans.from")} {loan.startMonth}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(monthlyPayment)} {t("common.perMonth")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("wizard.loans.totalInterest")} {formatCurrency(schedule.totalInterest)} €
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLoan(loan.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("wizard.loans.totalFinancing")}</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(totalLoanAmount)} €
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("wizard.loans.addLoan")}</CardTitle>
              <CardDescription>{t("wizard.loans.addLoanDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanName">{t("wizard.loans.name")}</Label>
                  <Input
                    id="loanName"
                    placeholder={t("wizard.loans.namePlaceholder")}
                    value={newLoan.name}
                    onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="loanAmount">{t("wizard.loans.loanAmount")}</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    min="0"
                    step="1000"
                    value={newLoan.amount}
                    onChange={(e) =>
                      setNewLoan({
                        ...newLoan,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="interestRate">{t("wizard.loans.interestRate")}</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={(newLoan.interestRate || 0) * 100}
                    onChange={(e) =>
                      setNewLoan({
                        ...newLoan,
                        interestRate: (parseFloat(e.target.value) || 0) / 100,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="termMonths">{t("wizard.loans.termMonths")}</Label>
                  <Input
                    id="termMonths"
                    type="number"
                    min="1"
                    max="360"
                    value={newLoan.termMonths}
                    onChange={(e) =>
                      setNewLoan({
                        ...newLoan,
                        termMonths: parseInt(e.target.value) || 60,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="startMonth">{t("wizard.loans.startMonth")}</Label>
                  <Input
                    id="startMonth"
                    type="month"
                    value={newLoan.startMonth}
                    onChange={(e) => setNewLoan({ ...newLoan, startMonth: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gracePeriod">{t("wizard.loans.gracePeriod")}</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    min="0"
                    max="24"
                    value={newLoan.gracePeriodMonths}
                    onChange={(e) =>
                      setNewLoan({
                        ...newLoan,
                        gracePeriodMonths: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {previewMonthlyPayment > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t("wizard.loans.estimatedMonthly")}</span>
                      <span className="font-semibold">
                        {formatCurrency(previewMonthlyPayment)} €
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button onClick={handleAddLoan}>{t("common.add")}</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("wizard.loans.addLoan")}
          </Button>
        )}

        {loansList.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("wizard.loans.noLoans")}</p>
            <p className="text-sm">{t("wizard.loans.canSkipLoans")}</p>
          </div>
        )}
      </div>
    </WizardLayout>
  );
}
