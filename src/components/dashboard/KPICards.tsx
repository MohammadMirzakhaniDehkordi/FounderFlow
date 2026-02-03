"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Percent,
  Building2,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import type { YearSummary, MonthlyCalculation } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface KPICardsProps {
  yearSummaries: Record<number, YearSummary>;
  startYear: number;
  monthlyData?: Record<string, MonthlyCalculation>;
}

export function KPICards({ yearSummaries, startYear, monthlyData }: KPICardsProps) {
  const { t, locale } = useTranslation();
  const year1 = yearSummaries[startYear];
  const year2 = yearSummaries[startYear + 1];
  const year3 = yearSummaries[startYear + 2];
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const calculateGrowth = (start: number, end: number) => {
    if (start === 0) return end > 0 ? 100 : 0;
    return Math.round(((end - start) / Math.abs(start)) * 100);
  };

  // Calculate break-even month
  const calculateBreakEven = () => {
    if (!monthlyData) return null;
    const months = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b));
    for (const [month, data] of months) {
      const monthlyProfit = data.revenue - (data.personnelCosts + data.operatingCosts);
      if (monthlyProfit >= 0) {
        const [year, m] = month.split("-");
        return `${m}/${year}`;
      }
    }
    return null;
  };

  // Calculate runway (months until liquidity runs out)
  const calculateRunway = () => {
    if (!monthlyData) return null;
    const months = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b));
    let negativeMonth = null;
    for (const [month, data] of months) {
      if (data.endBalance < 0) {
        const [year, m] = month.split("-");
        negativeMonth = `${m}/${year}`;
        break;
      }
    }
    if (!negativeMonth) return ">36";
    return negativeMonth;
  };

  // Calculate average monthly burn rate (Year 1)
  const calculateBurnRate = () => {
    if (!year1) return 0;
    const monthlyBurn = (year1.totalCosts - year1.totalRevenue) / 12;
    return monthlyBurn > 0 ? monthlyBurn : 0;
  };

  const revenueGrowth = calculateGrowth(year1?.totalRevenue || 0, year3?.totalRevenue || 0);
  const profitMarginYear3 = year3?.totalRevenue
    ? Math.round((year3.netProfit / year3.totalRevenue) * 100)
    : 0;
  
  const breakEvenMonth = calculateBreakEven();
  const runway = calculateRunway();
  const burnRate = calculateBurnRate();

  // Total UG reserve
  const totalUGReserve = (year1?.ugReserve || 0) + (year2?.ugReserve || 0) + (year3?.ugReserve || 0);
  const stammkapitalProgress = Math.min((totalUGReserve / 25000) * 100, 100);

  const runwayIsLong = runway === ">36";
  const runwayDisplay = runwayIsLong ? t("dashboard.monthsShort") : runway;
  const kpis = [
    {
      title: t("dashboard.revenueYear1"),
      value: formatCurrency(year1?.totalRevenue || 0),
      icon: TrendingUp,
      description: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% ${t("common.year")} 3`,
      trend: revenueGrowth >= 0 ? "up" : "down",
      color: "text-blue-500",
    },
    {
      title: t("dashboard.profitYear3"),
      value: formatCurrency(year3?.netProfit || 0),
      icon: (year3?.netProfit || 0) >= 0 ? PiggyBank : TrendingDown,
      description: t("dashboard.afterTaxes"),
      trend: (year3?.netProfit || 0) >= 0 ? "up" : "down",
      color: (year3?.netProfit || 0) >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: t("dashboard.endLiquidity"),
      value: formatCurrency(year3?.endLiquidity || 0),
      icon: Wallet,
      description: t("dashboard.endYear3"),
      trend: (year3?.endLiquidity || 0) >= 0 ? "up" : "down",
      color: (year3?.endLiquidity || 0) >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: t("dashboard.breakEven"),
      value: breakEvenMonth || t("dashboard.notReached"),
      icon: breakEvenMonth ? Target : AlertTriangle,
      description: breakEvenMonth ? t("dashboard.profitableFrom") : t("dashboard.in3Years"),
      trend: breakEvenMonth ? "up" : "down",
      color: breakEvenMonth ? "text-green-500" : "text-amber-500",
    },
    {
      title: t("dashboard.profitMargin"),
      value: `${profitMarginYear3}%`,
      icon: Percent,
      description: `${t("common.year")} 3`,
      trend: profitMarginYear3 >= 10 ? "up" : profitMarginYear3 >= 0 ? "neutral" : "down",
      color: profitMarginYear3 >= 10 ? "text-green-500" : profitMarginYear3 >= 0 ? "text-amber-500" : "text-red-500",
    },
    {
      title: t("dashboard.runway"),
      value: runwayDisplay,
      icon: runwayIsLong ? CheckCircle : Clock,
      description: t("dashboard.liquidityUntil"),
      trend: runwayIsLong ? "up" : "neutral",
      color: runwayIsLong ? "text-green-500" : "text-amber-500",
    },
    {
      title: t("dashboard.burnRate"),
      value: burnRate > 0 ? formatCurrency(burnRate) : "0 €",
      icon: TrendingDown,
      description: t("dashboard.avgMonthlyYear1"),
      trend: burnRate === 0 ? "up" : "down",
      color: burnRate > 0 ? "text-red-500" : "text-green-500",
    },
    {
      title: t("dashboard.totalTaxes"),
      value: formatCurrency(
        (year1?.totalTaxes || 0) + (year2?.totalTaxes || 0) + (year3?.totalTaxes || 0)
      ),
      icon: Building2,
      description: t("dashboard.threeYears"),
      trend: "neutral",
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.slice(0, 4).map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.slice(4).map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* UG Reserve Progress */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              <span className="font-semibold">{t("dashboard.ugReserve")}</span>
            </div>
            <Badge variant={stammkapitalProgress >= 100 ? "default" : "secondary"}>
              {stammkapitalProgress >= 100 ? t("dashboard.goalReached") : `${Math.round(stammkapitalProgress)}%`}
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-3 mb-2">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stammkapitalProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(totalUGReserve)} {t("dashboard.saved")}</span>
            <span>{t("dashboard.goal")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
