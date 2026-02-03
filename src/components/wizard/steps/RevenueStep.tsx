"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WizardLayout } from "../WizardLayout";
import { useWizardStore } from "@/lib/store/wizardStore";
import { generateMonthKeys } from "@/lib/calculations/liquidity";
import { TrendingUp, Calculator, Calendar } from "lucide-react";

const MONTHS_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

export function RevenueStep() {
  const { revenue, plan, updateRevenue } = useWizardStore();
  const [revenueModel, setRevenueModel] = useState<"fixed" | "growth" | "custom">(
    revenue.revenueModel || "fixed"
  );

  const [fixedRevenue, setFixedRevenue] = useState(revenue.fixedMonthlyRevenue || 0);
  const [growthStart, setGrowthStart] = useState(revenue.growthStartRevenue || 0);
  const [growthEnd, setGrowthEnd] = useState(revenue.growthEndRevenue || 0);
  const [customMonths, setCustomMonths] = useState<Record<string, number>>(
    Object.fromEntries(
      Object.entries(revenue.months || {}).map(([k, v]) => [k, v.total || 0])
    )
  );

  const monthKeys = generateMonthKeys(plan.startYear, 3);

  const handleNext = () => {
    const months: Record<string, { unitPrice: number; unitsSold: number; total: number }> = {};

    if (revenueModel === "fixed") {
      // Apply fixed revenue to all months
      for (const month of monthKeys) {
        months[month] = { unitPrice: fixedRevenue, unitsSold: 1, total: fixedRevenue };
      }
    } else if (revenueModel === "growth") {
      // Linear growth from start to end over 36 months
      const totalMonths = monthKeys.length;
      const increment = (growthEnd - growthStart) / (totalMonths - 1);
      for (let i = 0; i < totalMonths; i++) {
        const value = Math.round(growthStart + increment * i);
        months[monthKeys[i]] = { unitPrice: value, unitsSold: 1, total: value };
      }
    } else {
      // Custom - use entered values
      for (const month of monthKeys) {
        const value = customMonths[month] || 0;
        months[month] = { unitPrice: value, unitsSold: 1, total: value };
      }
    }

    updateRevenue({
      revenueModel,
      fixedMonthlyRevenue: fixedRevenue,
      growthStartRevenue: growthStart,
      growthEndRevenue: growthEnd,
      months,
    });
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    return `${MONTHS_DE[parseInt(month) - 1]} ${year}`;
  };

  return (
    <WizardLayout onNext={handleNext}>
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Wie möchten Sie Ihren Umsatz planen? Wählen Sie das Modell, das am besten zu Ihrem Geschäft passt.
        </p>

        <Tabs value={revenueModel} onValueChange={(v) => setRevenueModel(v as typeof revenueModel)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fixed" className="gap-2">
              <Calculator className="h-4 w-4" />
              Fest
            </TabsTrigger>
            <TabsTrigger value="growth" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Wachstum
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Calendar className="h-4 w-4" />
              Individuell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fixed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Fester Monatsumsatz</CardTitle>
                <CardDescription>
                  Gleicher Umsatz jeden Monat über die gesamte Planungsperiode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fixedRevenue">Monatlicher Umsatz (€)</Label>
                    <Input
                      id="fixedRevenue"
                      type="number"
                      min="0"
                      step="100"
                      value={fixedRevenue}
                      onChange={(e) => setFixedRevenue(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Jahresumsatz:</strong> {(fixedRevenue * 12).toLocaleString("de-DE")} €
                    </p>
                    <p className="text-sm">
                      <strong>3-Jahres-Umsatz:</strong> {(fixedRevenue * 36).toLocaleString("de-DE")} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Lineares Wachstum</CardTitle>
                <CardDescription>
                  Der Umsatz wächst linear von einem Start- zu einem Endwert
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="growthStart">Startumsatz (Monat 1) (€)</Label>
                    <Input
                      id="growthStart"
                      type="number"
                      min="0"
                      step="100"
                      value={growthStart}
                      onChange={(e) => setGrowthStart(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="growthEnd">Endumsatz (Monat 36) (€)</Label>
                    <Input
                      id="growthEnd"
                      type="number"
                      min="0"
                      step="100"
                      value={growthEnd}
                      onChange={(e) => setGrowthEnd(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg mt-4">
                  <p className="text-sm">
                    <strong>Durchschnittlicher Monatsumsatz:</strong>{" "}
                    {Math.round((growthStart + growthEnd) / 2).toLocaleString("de-DE")} €
                  </p>
                  <p className="text-sm">
                    <strong>Monatliches Wachstum:</strong>{" "}
                    {Math.round((growthEnd - growthStart) / 35).toLocaleString("de-DE")} €
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Individuelle Planung</CardTitle>
                <CardDescription>
                  Geben Sie den Umsatz für jeden Monat einzeln ein
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[0, 1, 2].map((yearOffset) => {
                    const year = plan.startYear + yearOffset;
                    const yearMonths = monthKeys.filter((m) => m.startsWith(`${year}-`));
                    
                    return (
                      <div key={year}>
                        <h4 className="font-medium mb-3">Jahr {year}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {yearMonths.map((month) => (
                            <div key={month}>
                              <Label className="text-xs">{formatMonth(month)}</Label>
                              <Input
                                type="number"
                                min="0"
                                step="100"
                                value={customMonths[month] || 0}
                                onChange={(e) =>
                                  setCustomMonths({
                                    ...customMonths,
                                    [month]: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="mt-1"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Jahressumme: {yearMonths.reduce((sum, m) => sum + (customMonths[m] || 0), 0).toLocaleString("de-DE")} €
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </WizardLayout>
  );
}
