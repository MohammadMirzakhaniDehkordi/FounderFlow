"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WizardLayout } from "../WizardLayout";
import { useWizardStore } from "@/lib/store/wizardStore";
import type { Investment } from "@/lib/types";
import { Plus, Trash2, Package, Laptop, Armchair, Car, HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const CATEGORIES = [
  { value: "equipment", labelKey: "wizard.investments.equipment", icon: Package },
  { value: "software", labelKey: "wizard.investments.software", icon: Laptop },
  { value: "furniture", labelKey: "wizard.investments.furniture", icon: Armchair },
  { value: "vehicles", labelKey: "wizard.investments.vehicles", icon: Car },
  { value: "other", labelKey: "wizard.investments.other", icon: HelpCircle },
] as const;

export function InvestmentsStep() {
  const { investments, plan, addInvestment, removeInvestment } = useWizardStore();
  const { t, locale } = useTranslation();
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";
  const [showForm, setShowForm] = useState(false);
  const [newInvestment, setNewInvestment] = useState<Partial<Investment>>({
    name: "",
    amount: 0,
    month: `${plan.startYear}-01`,
    category: "equipment",
  });

  const items = investments.items || [];

  const handleAddInvestment = () => {
    if (!newInvestment.name || !newInvestment.amount) return;

    const investment: Investment = {
      id: crypto.randomUUID(),
      name: newInvestment.name,
      amount: newInvestment.amount,
      month: newInvestment.month || `${plan.startYear}-01`,
      category: newInvestment.category || "equipment",
    };

    addInvestment(investment);
    setNewInvestment({
      name: "",
      amount: 0,
      month: `${plan.startYear}-01`,
      category: "equipment",
    });
    setShowForm(false);
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat?.icon || Package;
  };

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat ? t(cat.labelKey) : category;
  };

  const totalInvestments = items.reduce((sum, item) => sum + item.amount, 0);

  // Group by year
  const investmentsByYear = items.reduce((acc, item) => {
    const year = item.month.split("-")[0];
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {} as Record<string, Investment[]>);

  return (
    <WizardLayout>
      <div className="space-y-6">
        <p className="text-muted-foreground">{t("wizard.investments.intro")}</p>

        {/* Investment List */}
        {items.length > 0 && (
          <div className="space-y-4">
            {Object.entries(investmentsByYear).map(([year, yearItems]) => (
              <div key={year}>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                  {t("common.year")} {year}
                </h4>
                <div className="space-y-2">
                  {yearItems.map((item) => {
                    const Icon = getCategoryIcon(item.category);
                    return (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {getCategoryLabel(item.category)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.month}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">
                                {item.amount.toLocaleString(numberLocale)} €
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeInvestment(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("wizard.investments.totalInvestments")}</span>
                  <span className="font-bold text-lg">
                    {totalInvestments.toLocaleString(numberLocale)} €
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Investment Form */}
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("wizard.investments.addInvestment")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t("wizard.investments.name")}</Label>
                  <Input
                    id="name"
                    placeholder={t("wizard.investments.namePlaceholder")}
                    value={newInvestment.name}
                    onChange={(e) =>
                      setNewInvestment({ ...newInvestment, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">{t("wizard.investments.amount")}</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="100"
                    value={newInvestment.amount}
                    onChange={(e) =>
                      setNewInvestment({
                        ...newInvestment,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="month">{t("wizard.investments.month")}</Label>
                  <Input
                    id="month"
                    type="month"
                    value={newInvestment.month}
                    onChange={(e) =>
                      setNewInvestment({ ...newInvestment, month: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">{t("wizard.investments.category")}</Label>
                  <Select
                    value={newInvestment.category}
                    onValueChange={(value) =>
                      setNewInvestment({
                        ...newInvestment,
                        category: value as Investment["category"],
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {t(cat.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddInvestment}>{t("common.add")}</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("wizard.investments.addInvestment")}
          </Button>
        )}

        {items.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("wizard.investments.noInvestments")}</p>
            <p className="text-sm">{t("wizard.investments.canSkip")}</p>
          </div>
        )}
      </div>
    </WizardLayout>
  );
}
