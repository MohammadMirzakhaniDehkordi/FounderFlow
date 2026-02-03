"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { YearSummary } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface RevenueExpenseChartProps {
  data: Record<number, YearSummary>;
  startYear: number;
}

export function RevenueExpenseChart({ data, startYear }: RevenueExpenseChartProps) {
  const { t } = useTranslation();

  const chartData = [0, 1, 2].map((i) => {
    const year = startYear + i;
    const summary = data[year];
    return {
      year: `${t("common.year")} ${year}`,
      [t("charts.revenue")]: summary?.totalRevenue || 0,
      [t("charts.costs")]: summary?.totalCosts || 0,
      [t("charts.profit")]: summary?.netProfit || 0,
    };
  });

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(0)}k €`;
    }
    return `${value.toFixed(0)} €`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.revenueExpenseTitle")}</CardTitle>
        <CardDescription>{t("charts.revenueExpenseDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar dataKey={t("charts.revenue")} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t("charts.costs")} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t("charts.profit")} fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
