"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyCalculation } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface LiquidityChartProps {
  data: Record<string, MonthlyCalculation>;
}

export function LiquidityChart({ data }: LiquidityChartProps) {
  const { t } = useTranslation();

  const chartData = Object.entries(data).map(([month, calc]) => {
    const [, monthNum] = month.split("-");
    return {
      month: `${t(`monthsShort.${monthNum}`)} ${month.split("-")[0].slice(2)}`,
      endBalance: calc.endBalance,
      revenue: calc.revenue,
      outflows: calc.totalOutflows,
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
        <CardTitle>{t("charts.liquidityTitle")}</CardTitle>
        <CardDescription>{t("charts.liquidityDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                interval={2}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), ""]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="endBalance"
                name={t("cashflowTable.accountBalance")}
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
