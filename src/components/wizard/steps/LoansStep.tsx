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

export function LoansStep() {
  const { loans, plan, addLoan, removeLoan } = useWizardStore();
  const [showForm, setShowForm] = useState(false);
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({
    name: "",
    amount: 0,
    interestRate: 0.035, // 3.5% default
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

  // Calculate monthly payment preview
  const previewMonthlyPayment = newLoan.amount && newLoan.interestRate && newLoan.termMonths
    ? calculateMonthlyPayment(
        newLoan.amount,
        newLoan.interestRate,
        newLoan.termMonths - (newLoan.gracePeriodMonths || 0)
      )
    : 0;

  return (
    <WizardLayout>
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Erfassen Sie Ihre Finanzierungen wie Bankdarlehen, KfW-Kredite oder andere Darlehen.
        </p>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Hinweis zu Krediten
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  Die Kreditsumme erhöht Ihre Liquidität zu Beginn, aber die monatlichen Raten 
                  (Tilgung + Zinsen) werden als Ausgaben verbucht. Tilgungsfreie Zeiten werden 
                  bei der Berechnung berücksichtigt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan List */}
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
                                {loan.gracePeriodMonths} Mon. tilgungsfrei
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                            <p>
                              {loan.amount.toLocaleString("de-DE")} € • {(loan.interestRate * 100).toFixed(1)}% Zinsen • {loan.termMonths} Monate
                            </p>
                            <p>Ab {loan.startMonth}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="text-right">
                          <p className="font-semibold">
                            {monthlyPayment.toLocaleString("de-DE")} €/Mon
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Gesamt-Zinsen: {schedule.totalInterest.toLocaleString("de-DE")} €
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
                  <span className="font-medium">Gesamte Finanzierung</span>
                  <span className="font-bold text-lg">
                    {totalLoanAmount.toLocaleString("de-DE")} €
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Loan Form */}
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Neues Darlehen hinzufügen</CardTitle>
              <CardDescription>
                Geben Sie die Konditionen Ihres Darlehens ein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanName">Bezeichnung</Label>
                  <Input
                    id="loanName"
                    placeholder="z.B. KfW-Gründerkredit, Hausbank"
                    value={newLoan.name}
                    onChange={(e) =>
                      setNewLoan({ ...newLoan, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="loanAmount">Darlehenssumme (€)</Label>
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
                  <Label htmlFor="interestRate">Zinssatz (% p.a.)</Label>
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
                  <Label htmlFor="termMonths">Laufzeit (Monate)</Label>
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
                  <Label htmlFor="startMonth">Startmonat</Label>
                  <Input
                    id="startMonth"
                    type="month"
                    value={newLoan.startMonth}
                    onChange={(e) =>
                      setNewLoan({ ...newLoan, startMonth: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gracePeriod">Tilgungsfreie Zeit (Monate)</Label>
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

              {/* Payment Preview */}
              {previewMonthlyPayment > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Geschätzte monatliche Rate:</span>
                      <span className="font-semibold">
                        {previewMonthlyPayment.toLocaleString("de-DE")} €
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button onClick={handleAddLoan}>Hinzufügen</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Abbrechen
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
            Darlehen hinzufügen
          </Button>
        )}

        {loansList.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Finanzierungen erfasst.</p>
            <p className="text-sm">
              Sie können diesen Schritt überspringen, wenn keine Kredite geplant sind.
            </p>
          </div>
        )}
      </div>
    </WizardLayout>
  );
}
