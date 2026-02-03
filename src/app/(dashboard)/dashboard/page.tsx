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
import {
  Plus,
  FileText,
  Download,
  Settings,
  LogOut,
  Calculator,
  Building2,
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
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const [result, setResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    // Load result from localStorage (in a real app, this would be from Firestore)
    const stored = localStorage.getItem("founderflow-result");
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, []);

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

          <div className="flex items-center gap-4">
            <Link href="/new-plan">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Neuer Plan
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
                      {user?.displayName || "Benutzer"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Einstellungen</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {result ? (
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
                    BWA anzeigen
                  </Button>
                </Link>
                <Link href="/export">
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    PDF Export
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
                <TabsTrigger value="cashflow">Cashflow</TabsTrigger>
                <TabsTrigger value="bwa">BWA Vorschau</TabsTrigger>
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
                    <CardTitle>BWA (Betriebswirtschaftliche Auswertung)</CardTitle>
                    <CardDescription>
                      Rentabilitätsvorschau im Bankformat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Die vollständige BWA finden Sie im PDF-Export.
                    </p>
                    <Link href="/export" className="mt-4 inline-block">
                      <Button>
                        <FileText className="mr-2 h-4 w-4" />
                        BWA & Liquiditätsplan exportieren
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
            <h2 className="text-2xl font-bold mb-2">Noch kein Finanzplan</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Erstellen Sie Ihren ersten Finanzplan in wenigen Minuten mit unserem
              interaktiven Assistenten.
            </p>
            <Link href="/new-plan">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Ersten Plan erstellen
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
