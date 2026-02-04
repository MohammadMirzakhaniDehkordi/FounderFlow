"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WizardLayout } from "../WizardLayout";
import { useWizardStore } from "@/lib/store/wizardStore";
import type { OperatingCostItem } from "@/lib/types";
import { Plus, Trash2, Receipt, Package } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

// Suggested expense categories (user can add custom ones)
const SUGGESTED_EXPENSES = [
  { name: "Miete", nameEn: "Rent", nameFa: "اجاره", description: "Büro, Coworking, Lager" },
  { name: "Telefon & Internet", nameEn: "Phone & Internet", nameFa: "تلفن و اینترنت", description: "Festnetz, Mobil, DSL" },
  { name: "Fahrt-/Reisekosten", nameEn: "Travel Costs", nameFa: "هزینه سفر", description: "PKW, Benzin, Leasing" },
  { name: "Versicherungen", nameEn: "Insurance", nameFa: "بیمه", description: "Betriebshaftpflicht, etc." },
  { name: "Marketing", nameEn: "Marketing", nameFa: "بازاریابی", description: "Web, Social Media, Werbung" },
  { name: "Software Lizenzen", nameEn: "Software Licenses", nameFa: "مجوز نرم‌افزار", description: "Zoom, Microsoft, SaaS" },
  { name: "Steuerberater", nameEn: "Accountant", nameFa: "حسابدار", description: "Buchhaltung, DATEV" },
  { name: "Büromaterial", nameEn: "Office Supplies", nameFa: "لوازم اداری", description: "Papier, Drucker, etc." },
  { name: "IHK Beiträge", nameEn: "Chamber Fees", nameFa: "حق عضویت اتاق", description: "Industrie- und Handelskammer" },
  { name: "Materialkosten", nameEn: "Material Costs", nameFa: "هزینه مواد", description: "Rohstoffe, Verbrauchsmaterial" },
  { name: "Werkzeuge", nameEn: "Tools", nameFa: "ابزار", description: "Arbeitsgeräte, Maschinen" },
  { name: "Wartung & Reparatur", nameEn: "Maintenance", nameFa: "تعمیر و نگهداری", description: "Instandhaltung" },
];

export function OperatingCostsStep() {
  const { operatingCosts, addExpenseItem, updateExpenseItem, removeExpenseItem } = useWizardStore();
  const { t, locale } = useTranslation();
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";
  
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<OperatingCostItem>>({
    name: "",
    amount: 0,
    description: "",
  });

  const expenseItems = operatingCosts.items || [];
  const totalMonthly = expenseItems.reduce((sum, item) => sum + item.amount, 0);

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;

    const expense: OperatingCostItem = {
      id: crypto.randomUUID(),
      name: newExpense.name,
      amount: newExpense.amount,
      description: newExpense.description,
    };

    addExpenseItem(expense);
    setNewExpense({ name: "", amount: 0, description: "" });
    setShowForm(false);
  };

  const handleAmountChange = (id: string, amount: number) => {
    updateExpenseItem(id, { amount });
  };

  const handleAddSuggested = (suggestion: typeof SUGGESTED_EXPENSES[0]) => {
    // Check if already exists
    const exists = expenseItems.some(
      (item) => item.name.toLowerCase() === suggestion.name.toLowerCase()
    );
    if (exists) return;

    const name = locale === "en" ? suggestion.nameEn : locale === "fa" ? suggestion.nameFa : suggestion.name;
    const expense: OperatingCostItem = {
      id: crypto.randomUUID(),
      name: name,
      amount: 0,
      description: suggestion.description,
    };
    addExpenseItem(expense);
  };

  // Get suggestions that haven't been added yet
  const availableSuggestions = SUGGESTED_EXPENSES.filter(
    (suggestion) =>
      !expenseItems.some(
        (item) =>
          item.name.toLowerCase() === suggestion.name.toLowerCase() ||
          item.name.toLowerCase() === suggestion.nameEn.toLowerCase() ||
          item.name === suggestion.nameFa
      )
  );

  return (
    <WizardLayout>
      <div className="space-y-6">
        <p className="text-muted-foreground">{t("wizard.operatingCosts.intro")}</p>

        {/* Current Expense Items */}
        {expenseItems.length > 0 && (
          <div className="space-y-3">
            {expenseItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-32">
                        <Input
                          type="number"
                          min="0"
                          step="10"
                          value={item.amount}
                          onChange={(e) =>
                            handleAmountChange(item.id, parseFloat(e.target.value) || 0)
                          }
                          className="pr-8 text-right"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          €
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExpenseItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add New Expense Form */}
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("wizard.operatingCosts.addExpense")}</CardTitle>
              <CardDescription>{t("wizard.operatingCosts.addExpenseDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expenseName">{t("wizard.operatingCosts.expenseName")}</Label>
                  <Input
                    id="expenseName"
                    placeholder={t("wizard.operatingCosts.expenseNamePlaceholder")}
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="expenseAmount">{t("wizard.operatingCosts.monthlyAmount")}</Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    min="0"
                    step="10"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="expenseDesc">{t("wizard.operatingCosts.expenseDescription")}</Label>
                  <Input
                    id="expenseDesc"
                    placeholder={t("wizard.operatingCosts.expenseDescPlaceholder")}
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, description: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddExpense}>{t("common.add")}</Button>
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
            {t("wizard.operatingCosts.addExpense")}
          </Button>
        )}

        {/* Suggested Expenses */}
        {availableSuggestions.length > 0 && (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("wizard.operatingCosts.suggestions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.slice(0, 6).map((suggestion, index) => {
                  const displayName =
                    locale === "en"
                      ? suggestion.nameEn
                      : locale === "fa"
                      ? suggestion.nameFa
                      : suggestion.name;
                  return (
                    <Button
                      key={index}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddSuggested(suggestion)}
                      className="text-xs"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {displayName}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {expenseItems.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("wizard.operatingCosts.noExpenses")}</p>
            <p className="text-sm">{t("wizard.operatingCosts.clickToAdd")}</p>
          </div>
        )}

        {/* Summary */}
        {expenseItems.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{t("wizard.operatingCosts.totalOperatingCosts")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {expenseItems.length} {t("wizard.operatingCosts.expenseItems")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {totalMonthly.toLocaleString(numberLocale)} €
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(totalMonthly * 12).toLocaleString(numberLocale)} €{t("common.perYear")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </WizardLayout>
  );
}
