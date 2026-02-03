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
import { useTranslation } from "@/lib/i18n";

export function RevenueStep() {
  const { revenue, plan, updateRevenue } = useWizardStore();
  const { t, locale } = useTranslation();
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
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";

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
    return `${t(`months.${parseInt(month)}`)} ${year}`;
  };

  return (
    <WizardLayout onNext={handleNext}>
      <div className="space-y-6">
        <p className="text-muted-foreground">{t("wizard.revenue.intro")}</p>

        <Tabs value={revenueModel} onValueChange={(v) => setRevenueModel(v as typeof revenueModel)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fixed" className="gap-2">
              <Calculator className="h-4 w-4" />
              {t("wizard.revenue.fixed")}
            </TabsTrigger>
            <TabsTrigger value="growth" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("wizard.revenue.growth")}
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Calendar className="h-4 w-4" />
              {t("wizard.revenue.custom")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fixed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("wizard.revenue.fixedTitle")}</CardTitle>
                <CardDescription>{t("wizard.revenue.fixedDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fixedRevenue">{t("wizard.revenue.monthlyRevenue")}</Label>
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
                      <strong>{t("wizard.revenue.annualRevenue")}</strong>{" "}
                      {(fixedRevenue * 12).toLocaleString(numberLocale)} €
                    </p>
                    <p className="text-sm">
                      <strong>{t("wizard.revenue.threeYearRevenue")}</strong>{" "}
                      {(fixedRevenue * 36).toLocaleString(numberLocale)} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("wizard.revenue.growthTitle")}</CardTitle>
                <CardDescription>{t("wizard.revenue.growthDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="growthStart">{t("wizard.revenue.startRevenue")}</Label>
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
                    <Label htmlFor="growthEnd">{t("wizard.revenue.endRevenue")}</Label>
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
                    <strong>{t("wizard.revenue.avgMonthly")}</strong>{" "}
                    {Math.round((growthStart + growthEnd) / 2).toLocaleString(numberLocale)} €
                  </p>
                  <p className="text-sm">
                    <strong>{t("wizard.revenue.monthlyGrowth")}</strong>{" "}
                    {Math.round((growthEnd - growthStart) / 35).toLocaleString(numberLocale)} €
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("wizard.revenue.customTitle")}</CardTitle>
                <CardDescription>{t("wizard.revenue.customDesc")}</CardDescription>
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
                          {t("wizard.revenue.yearSum")}{" "}
                          {yearMonths
                            .reduce((sum, m) => sum + (customMonths[m] || 0), 0)
                            .toLocaleString(numberLocale)}{" "}
                          €
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
