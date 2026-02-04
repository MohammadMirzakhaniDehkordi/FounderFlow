"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { LiquidityChart } from "@/components/dashboard/LiquidityChart";
import { RevenueExpenseChart } from "@/components/dashboard/RevenueExpenseChart";
import { CashFlowTable } from "@/components/dashboard/CashFlowTable";
import { KPICards } from "@/components/dashboard/KPICards";
import type { LiquidityResult } from "@/lib/calculations/liquidity";
import type { Company } from "@/lib/types";
import { useFinancialPlan } from "@/lib/hooks/useFinancialPlan";
import { useWizardStore } from "@/lib/store/wizardStore";
import { calculateLiquidity } from "@/lib/calculations/liquidity";
import type { RevenueData, PersonnelData, OperatingCostsData, InvestmentsData, LoansData } from "@/lib/types";
import {
  Plus,
  FileText,
  Download,
  Settings,
  LogOut,
  Calculator,
  Building2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface StoredResult {
  company: Partial<Company>;
  plan: {
    name: string;
    startYear: number;
    startingLiquidity: number;
  };
  liquidityResult: LiquidityResult;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const [result, setResult] = useState<StoredResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserPlans } = useFinancialPlan();
  const wizardStore = useWizardStore();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      // First, try to load from localStorage (immediate display)
      const stored = localStorage.getItem("founderflow-result");
      if (stored) {
        try {
          setResult(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse localStorage data:", e);
        }
      }

      // If user is logged in, try to load from Firestore
      if (user) {
        try {
          const plans = await getUserPlans();
          if (plans.length > 0) {
            // Load the most recent plan
            const latestPlan = plans[0];
            const data = latestPlan.data;
            
            // Calculate liquidity from loaded data
            const planData = data.plan as { startYear?: number; startingLiquidity?: number; name?: string } | undefined;
            const companyData = data.company as { stammkapital?: number; hebesatz?: number; companyName?: string } | undefined;
            
            const startYear = typeof planData?.startYear === 'number' ? planData.startYear : new Date().getFullYear();
            const startingLiquidity = typeof planData?.startingLiquidity === 'number' ? planData.startingLiquidity : 0;
            const stammkapital = typeof companyData?.stammkapital === 'number' ? companyData.stammkapital : 1;
            const hebesatz = typeof companyData?.hebesatz === 'number' ? companyData.hebesatz : 400;

            const liquidityResult = calculateLiquidity({
              startYear,
              startingLiquidity,
              stammkapital,
              hebesatz,
              revenue: data.revenue as unknown as RevenueData,
              personnel: data.personnel as unknown as PersonnelData,
              operatingCosts: data.operatingCosts as unknown as OperatingCostsData,
              investments: data.investments as unknown as InvestmentsData,
              loans: data.loans as unknown as LoansData,
            });

            const firestoreResult: StoredResult = {
              company: companyData as Partial<Company>,
              plan: {
                name: planData?.name || "Financial Plan",
                startYear,
                startingLiquidity,
              },
              liquidityResult,
            };

            setResult(firestoreResult);
            
            // Also update localStorage for consistency
            localStorage.setItem("founderflow-result", JSON.stringify(firestoreResult));
          }
        } catch (error) {
          console.error("Failed to load from Firestore:", error);
          // Continue with localStorage data if available
        }
      }

      setIsLoading(false);
    }

    loadData();
  }, [user, getUserPlans]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">FounderFlow</span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/new-plan">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("dashboard.newPlan")}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(user?.displayName || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName || t("common.user")}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("common.settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("common.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : result ? (
          <div className="space-y-8">
            {/* Company Info & Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{result.company.companyName}</h1>
                    <p className="text-muted-foreground">
                      {result.plan.name} ({result.plan.startYear} - {result.plan.startYear + 2})
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/export">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    {t("dashboard.showBWA")}
                  </Button>
                </Link>
                <Link href="/export">
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    {t("dashboard.pdfExport")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* KPI Cards */}
            <KPICards
              yearSummaries={result.liquidityResult.yearSummaries}
              startYear={result.plan.startYear}
              monthlyData={result.liquidityResult.months}
            />

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <LiquidityChart data={result.liquidityResult.months} />
              <RevenueExpenseChart
                data={result.liquidityResult.yearSummaries}
                startYear={result.plan.startYear}
              />
            </div>

            {/* Detailed Tables */}
            <Tabs defaultValue="cashflow">
              <TabsList>
                <TabsTrigger value="cashflow">{t("dashboard.cashflow")}</TabsTrigger>
                <TabsTrigger value="bwa">{t("dashboard.bwaTab")}</TabsTrigger>
              </TabsList>
              <TabsContent value="cashflow" className="mt-4">
                <CashFlowTable
                  data={result.liquidityResult.months}
                  startYear={result.plan.startYear}
                />
              </TabsContent>
              <TabsContent value="bwa" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("dashboard.bwaTitle")}</CardTitle>
                    <CardDescription>
                      {t("dashboard.bwaDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t("dashboard.bwaFullInPdf")}
                    </p>
                    <Link href="/export" className="mt-4 inline-block">
                      <Button>
                        <FileText className="mr-2 h-4 w-4" />
                        {t("dashboard.bwaExportBtn")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("dashboard.emptyTitle")}</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t("dashboard.emptyDesc")}
            </p>
            <Link href="/new-plan">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                {t("dashboard.createFirstPlan")}
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
