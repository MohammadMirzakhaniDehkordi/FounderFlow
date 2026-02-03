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

interface RevenueExpenseChartProps {
  data: Record<number, YearSummary>;
  startYear: number;
}

export function RevenueExpenseChart({ data, startYear }: RevenueExpenseChartProps) {
  const chartData = [0, 1, 2].map((i) => {
    const year = startYear + i;
    const summary = data[year];
    return {
      year: `Jahr ${year}`,
      Umsatz: summary?.totalRevenue || 0,
      Kosten: summary?.totalCosts || 0,
      Gewinn: summary?.netProfit || 0,
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
        <CardTitle>Umsatz & Kosten</CardTitle>
        <CardDescription>Jahresvergleich</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
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
              <Bar dataKey="Umsatz" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Kosten" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gewinn" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
