"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Percent, Building2 } from "lucide-react";
import type { YearSummary } from "@/lib/types";

interface KPICardsProps {
  yearSummaries: Record<number, YearSummary>;
  startYear: number;
}

export function KPICards({ yearSummaries, startYear }: KPICardsProps) {
  const year1 = yearSummaries[startYear];
  const year3 = yearSummaries[startYear + 2];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const calculateGrowth = (start: number, end: number) => {
    if (start === 0) return end > 0 ? 100 : 0;
    return Math.round(((end - start) / Math.abs(start)) * 100);
  };

  const revenueGrowth = calculateGrowth(year1?.totalRevenue || 0, year3?.totalRevenue || 0);
  const profitMarginYear3 = year3?.totalRevenue
    ? Math.round((year3.netProfit / year3.totalRevenue) * 100)
    : 0;

  const kpis = [
    {
      title: "Umsatz Jahr 1",
      value: formatCurrency(year1?.totalRevenue || 0),
      icon: TrendingUp,
      description: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% bis Jahr 3`,
      trend: revenueGrowth >= 0 ? "up" : "down",
    },
    {
      title: "Gewinn Jahr 3",
      value: formatCurrency(year3?.netProfit || 0),
      icon: (year3?.netProfit || 0) >= 0 ? PiggyBank : TrendingDown,
      description: `Nach Steuern`,
      trend: (year3?.netProfit || 0) >= 0 ? "up" : "down",
    },
    {
      title: "Endliquidität",
      value: formatCurrency(year3?.endLiquidity || 0),
      icon: Wallet,
      description: "Ende Jahr 3",
      trend: (year3?.endLiquidity || 0) >= 0 ? "up" : "down",
    },
    {
      title: "Gewinnmarge",
      value: `${profitMarginYear3}%`,
      icon: Percent,
      description: "Jahr 3",
      trend: profitMarginYear3 >= 10 ? "up" : profitMarginYear3 >= 0 ? "neutral" : "down",
    },
    {
      title: "Steuern gesamt",
      value: formatCurrency(
        (year1?.totalTaxes || 0) + (yearSummaries[startYear + 1]?.totalTaxes || 0) + (year3?.totalTaxes || 0)
      ),
      icon: Building2,
      description: "3 Jahre",
      trend: "neutral",
    },
    {
      title: "UG-Rücklage",
      value: formatCurrency(
        (year1?.ugReserve || 0) + (yearSummaries[startYear + 1]?.ugReserve || 0) + (year3?.ugReserve || 0)
      ),
      icon: PiggyBank,
      description: "Aufbau Stammkapital",
      trend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon
              className={`h-4 w-4 ${
                kpi.trend === "up"
                  ? "text-green-500"
                  : kpi.trend === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
