"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WizardLayout } from "../WizardLayout";
import { useWizardStore } from "@/lib/store/wizardStore";
import { calculateLiquidity, checkLiquidityWarnings } from "@/lib/calculations/liquidity";
import { calculateTaxes } from "@/lib/calculations/taxes";
import type { RevenueData, PersonnelData, OperatingCostsData, InvestmentsData, LoansData } from "@/lib/types";
import {
  Building2,
  TrendingUp,
  Users,
  Receipt,
  Package,
  Landmark,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export function ReviewStep() {
  const router = useRouter();
  const {
    company,
    plan,
    revenue,
    personnel,
    operatingCosts,
    investments,
    loans,
    reset,
  } = useWizardStore();

  // Calculate financial projections
  const liquidityResult = useMemo(() => {
    return calculateLiquidity({
      startYear: plan.startYear,
      startingLiquidity: plan.startingLiquidity,
      stammkapital: company.stammkapital || 1,
      hebesatz: company.hebesatz || 400,
      revenue: revenue as RevenueData,
      personnel: personnel as PersonnelData,
      operatingCosts: operatingCosts as OperatingCostsData,
      investments: investments as InvestmentsData,
      loans: loans as LoansData,
    });
  }, [company, plan, revenue, personnel, operatingCosts, investments, loans]);

  const warnings = checkLiquidityWarnings(liquidityResult);
  const hasWarnings = warnings.length > 0;

  // Calculate totals for display
  const totalPersonnelMonthly = (personnel.employees || []).reduce(
    (sum, emp) => sum + emp.monthlySalary,
    0
  );
  const totalOperatingMonthly = Object.values(operatingCosts.categories || {}).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const totalInvestments = (investments.items || []).reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalLoans = (loans.loans || []).reduce((sum, loan) => sum + loan.amount, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const handleFinish = async () => {
    // In a real app, this would save to Firestore
    // For now, we'll simulate success and redirect to dashboard
    toast.success("Finanzplan erstellt!");
    
    // Store the result for the dashboard (in a real app, this would be in Firestore)
    if (typeof window !== "undefined") {
      localStorage.setItem("founderflow-result", JSON.stringify({
        company,
        plan,
        liquidityResult,
      }));
    }
    
    router.push("/dashboard");
  };

  return (
    <WizardLayout onNext={handleFinish} nextLabel="Plan erstellen">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Überprüfen Sie Ihre Eingaben und die berechnete Finanzprognose.
        </p>

        {/* Warnings */}
        {hasWarnings && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Liquiditätswarnung
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    In {warnings.length} Monat(en) ist die Liquidität negativ. Überprüfen Sie Ihre Planung oder erhöhen Sie die Finanzierung.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Firma</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{company.companyName}</p>
              <p className="text-sm text-muted-foreground">
                Stammkapital: {formatCurrency(company.stammkapital || 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                Hebesatz: {company.hebesatz}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Umsatz (Jahr 1)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                {formatCurrency(liquidityResult.yearSummaries[plan.startYear]?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                Modell: {revenue.revenueModel === "fixed" ? "Fest" : revenue.revenueModel === "growth" ? "Wachstum" : "Individuell"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Personal</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                {formatCurrency(totalPersonnelMonthly)}/Monat
              </p>
              <p className="text-sm text-muted-foreground">
                {(personnel.employees || []).length} Mitarbeiter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Betriebskosten</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                {formatCurrency(totalOperatingMonthly)}/Monat
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(totalOperatingMonthly * 12)}/Jahr
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Investitionen</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{formatCurrency(totalInvestments)}</p>
              <p className="text-sm text-muted-foreground">
                {(investments.items || []).length} Position(en)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Finanzierung</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{formatCurrency(totalLoans)}</p>
              <p className="text-sm text-muted-foreground">
                {(loans.loans || []).length} Darlehen
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* 3-Year Projection Table */}
        <Card>
          <CardHeader>
            <CardTitle>3-Jahres-Prognose</CardTitle>
            <CardDescription>
              Übersicht über Umsatz, Kosten und Gewinn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kennzahl</TableHead>
                  <TableHead className="text-right">Jahr {plan.startYear}</TableHead>
                  <TableHead className="text-right">Jahr {plan.startYear + 1}</TableHead>
                  <TableHead className="text-right">Jahr {plan.startYear + 2}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Umsatz</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i} className="text-right">
                      {formatCurrency(
                        liquidityResult.yearSummaries[plan.startYear + i]?.totalRevenue || 0
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Gesamtkosten</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i} className="text-right">
                      {formatCurrency(
                        liquidityResult.yearSummaries[plan.startYear + i]?.totalCosts || 0
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Gewinn vor Steuern</TableCell>
                  {[0, 1, 2].map((i) => {
                    const profit = liquidityResult.yearSummaries[plan.startYear + i]?.profitBeforeTax || 0;
                    return (
                      <TableCell key={i} className={`text-right ${profit < 0 ? "text-destructive" : ""}`}>
                        {formatCurrency(profit)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Steuern (geschätzt)</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i} className="text-right">
                      {formatCurrency(
                        liquidityResult.yearSummaries[plan.startYear + i]?.totalTaxes || 0
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="font-semibold">
                  <TableCell>Gewinn nach Steuern</TableCell>
                  {[0, 1, 2].map((i) => {
                    const netProfit = liquidityResult.yearSummaries[plan.startYear + i]?.netProfit || 0;
                    return (
                      <TableCell key={i} className={`text-right ${netProfit < 0 ? "text-destructive" : "text-green-600"}`}>
                        {formatCurrency(netProfit)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">UG-Rücklage (25%)</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i} className="text-right">
                      {formatCurrency(
                        liquidityResult.yearSummaries[plan.startYear + i]?.ugReserve || 0
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold">Endliquidität</TableCell>
                  {[0, 1, 2].map((i) => {
                    const endLiq = liquidityResult.yearSummaries[plan.startYear + i]?.endLiquidity || 0;
                    return (
                      <TableCell key={i} className={`text-right font-semibold ${endLiq < 0 ? "text-destructive" : ""}`}>
                        {formatCurrency(endLiq)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Success indicator */}
        {!hasWarnings && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Finanzplan ist plausibel
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Ihre Liquidität bleibt über den gesamten Planungszeitraum positiv. 
                    Klicken Sie auf "Plan erstellen" um fortzufahren.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </WizardLayout>
  );
}
