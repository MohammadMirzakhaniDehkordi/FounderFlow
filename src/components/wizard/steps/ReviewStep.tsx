"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { useFinancialPlan } from "@/lib/hooks/useFinancialPlan";
import { useAuthContext } from "@/components/providers/AuthProvider";

export function ReviewStep() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { user } = useAuthContext();
  const { savePlan, loading: savingPlan } = useFinancialPlan();
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";
  const [isSaving, setIsSaving] = useState(false);

  const {
    company,
    plan,
    revenue,
    personnel,
    operatingCosts,
    investments,
    loans,
    planId,
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
  // Support both new items array and legacy categories
  const totalOperatingMonthly = operatingCosts.items
    ? operatingCosts.items.reduce((sum, item) => sum + item.amount, 0)
    : Object.values(operatingCosts.categories || {}).reduce((sum, val) => sum + (val || 0), 0);
  const totalInvestments = (investments.items || []).reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalLoans = (loans.loans || []).reduce((sum, loan) => sum + loan.amount, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const handleFinish = async () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage for immediate display
      if (typeof window !== "undefined") {
        localStorage.setItem("founderflow-result", JSON.stringify({
          company,
          plan,
          liquidityResult,
        }));
      }

      // Save to Firestore if user is logged in
      if (user) {
        try {
          await savePlan(planId || undefined);
          toast.success(t("wizard.review.planCreated"));
        } catch (error) {
          console.error("Failed to save to Firestore:", error);
          // Still continue to dashboard, data is in localStorage
          toast.success(t("wizard.review.planCreated"));
        }
      } else {
        toast.success(t("wizard.review.planCreated"));
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error finishing plan:", error);
      toast.error("Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <WizardLayout onNext={handleFinish} nextLabel={isSaving ? t("common.saving") : t("wizard.createPlan")} isLoading={isSaving}>
      <div className="space-y-6">
        <p className="text-muted-foreground">
          {t("wizard.review.intro")}
        </p>

        {/* Warnings */}
        {hasWarnings && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    {t("wizard.review.liquidityWarning")}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {t("wizard.review.liquidityWarningDesc", { count: String(warnings.length) })}
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
                <CardTitle className="text-sm font-medium">{t("wizard.review.company")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{company.companyName}</p>
              <p className="text-sm text-muted-foreground">
                {t("wizard.review.stammkapital")} {formatCurrency(company.stammkapital || 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("wizard.review.hebesatz")} {company.hebesatz}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{t("wizard.review.revenueYear1")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                {formatCurrency(liquidityResult.yearSummaries[plan.startYear]?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("wizard.review.model")} {revenue.revenueModel === "fixed" ? t("wizard.review.modelFixed") : revenue.revenueModel === "growth" ? t("wizard.review.modelGrowth") : t("wizard.review.modelCustom")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{t("wizard.review.personnel")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                {formatCurrency(totalPersonnelMonthly)}{t("common.perMonth")}
              </p>
              <p className="text-sm text-muted-foreground">
                {(personnel.employees || []).length} {t("wizard.review.employees")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{t("wizard.review.operatingCosts")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                {formatCurrency(totalOperatingMonthly)}{t("common.perMonth")}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(totalOperatingMonthly * 12)}{t("common.perYear")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{t("wizard.review.investments")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{formatCurrency(totalInvestments)}</p>
              <p className="text-sm text-muted-foreground">
                {(investments.items || []).length} {t("wizard.review.investmentsCount")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{t("wizard.review.financing")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{formatCurrency(totalLoans)}</p>
              <p className="text-sm text-muted-foreground">
                {(loans.loans || []).length} {t("wizard.review.loansCount")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* 3-Year Projection Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("wizard.review.threeYearProjection")}</CardTitle>
            <CardDescription>
              {t("wizard.review.projectionDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("wizard.review.metric")}</TableHead>
                  <TableHead className="text-right">{t("common.year")} {plan.startYear}</TableHead>
                  <TableHead className="text-right">{t("common.year")} {plan.startYear + 1}</TableHead>
                  <TableHead className="text-right">{t("common.year")} {plan.startYear + 2}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{t("wizard.review.revenue")}</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i} className="text-right">
                      {formatCurrency(
                        liquidityResult.yearSummaries[plan.startYear + i]?.totalRevenue || 0
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("wizard.review.totalCosts")}</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i} className="text-right">
                      {formatCurrency(
                        liquidityResult.yearSummaries[plan.startYear + i]?.totalCosts || 0
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("wizard.review.profitBeforeTax")}</TableCell>
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
                  <TableCell className="font-medium">{t("wizard.review.taxesEst")}</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i} className="text-right">
                      {formatCurrency(
                        liquidityResult.yearSummaries[plan.startYear + i]?.totalTaxes || 0
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="font-semibold">
                  <TableCell>{t("wizard.review.profitAfterTax")}</TableCell>
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
                  <TableCell className="font-medium">{t("wizard.review.ugReserve")}</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i} className="text-right">
                      {formatCurrency(
                        liquidityResult.yearSummaries[plan.startYear + i]?.ugReserve || 0
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold">{t("wizard.review.endLiquidity")}</TableCell>
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
                    {t("wizard.review.plausibleTitle")}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {t("wizard.review.plausibleDesc")}
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
