"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { WizardLayout } from "../WizardLayout";
import { useWizardStore } from "@/lib/store/wizardStore";
import {
  Home,
  Megaphone,
  Shield,
  Laptop,
  Phone,
  Car,
  Calculator,
  FileText,
  Building2,
  MoreHorizontal
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

// Categories matching German Betriebskosten from Excel template
const COST_CATEGORIES = [
  {
    key: "rent",
    labelKey: "wizard.operatingCosts.rent",
    descriptionKey: "wizard.operatingCosts.rentDesc",
    icon: Home,
    defaultValue: 200,
  },
  {
    key: "telephoneInternet",
    labelKey: "wizard.operatingCosts.telephoneInternet",
    descriptionKey: "wizard.operatingCosts.telephoneInternetDesc",
    icon: Phone,
    defaultValue: 10,
  },
  {
    key: "travelCosts",
    labelKey: "wizard.operatingCosts.travelCosts",
    descriptionKey: "wizard.operatingCosts.travelCostsDesc",
    icon: Car,
    defaultValue: 150,
  },
  {
    key: "insurance",
    labelKey: "wizard.operatingCosts.insurance",
    descriptionKey: "wizard.operatingCosts.insuranceDesc",
    icon: Shield,
    defaultValue: 20,
  },
  {
    key: "marketing",
    labelKey: "wizard.operatingCosts.marketing",
    descriptionKey: "wizard.operatingCosts.marketingDesc",
    icon: Megaphone,
    defaultValue: 350,
  },
  {
    key: "softwareLicenses",
    labelKey: "wizard.operatingCosts.softwareLicenses",
    descriptionKey: "wizard.operatingCosts.softwareLicensesDesc",
    icon: Laptop,
    defaultValue: 25,
  },
  {
    key: "accounting",
    labelKey: "wizard.operatingCosts.accounting",
    descriptionKey: "wizard.operatingCosts.accountingDesc",
    icon: Calculator,
    defaultValue: 0,
  },
  {
    key: "officeSupplies",
    labelKey: "wizard.operatingCosts.officeSupplies",
    descriptionKey: "wizard.operatingCosts.officeSuppliesDesc",
    icon: FileText,
    defaultValue: 0,
  },
  {
    key: "chamberFees",
    labelKey: "wizard.operatingCosts.chamberFees",
    descriptionKey: "wizard.operatingCosts.chamberFeesDesc",
    icon: Building2,
    defaultValue: 0,
  },
  {
    key: "other",
    labelKey: "wizard.operatingCosts.other",
    descriptionKey: "wizard.operatingCosts.otherDesc",
    icon: MoreHorizontal,
    defaultValue: 0,
  },
] as const;

export function OperatingCostsStep() {
  const { operatingCosts, updateOperatingCosts } = useWizardStore();
  const { t, locale } = useTranslation();
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";

  const form = useForm({
    defaultValues: {
      rent: operatingCosts.categories?.rent ?? 200,
      telephoneInternet: operatingCosts.categories?.telephoneInternet ?? 10,
      travelCosts: operatingCosts.categories?.travelCosts ?? 150,
      insurance: operatingCosts.categories?.insurance ?? 20,
      marketing: operatingCosts.categories?.marketing ?? 350,
      softwareLicenses: operatingCosts.categories?.softwareLicenses ?? 25,
      accounting: operatingCosts.categories?.accounting ?? 0,
      officeSupplies: operatingCosts.categories?.officeSupplies ?? 0,
      chamberFees: operatingCosts.categories?.chamberFees ?? 0,
      other: operatingCosts.categories?.other ?? 0,
    },
  });

  const values = form.watch();
  const totalMonthly = Object.values(values).reduce((sum, val) => sum + (val || 0), 0);

  const handleNext = () => {
    updateOperatingCosts({
      categories: {
        rent: values.rent,
        telephoneInternet: values.telephoneInternet,
        travelCosts: values.travelCosts,
        insurance: values.insurance,
        marketing: values.marketing,
        softwareLicenses: values.softwareLicenses,
        accounting: values.accounting,
        officeSupplies: values.officeSupplies,
        chamberFees: values.chamberFees,
        other: values.other,
      },
    });
  };

  return (
    <WizardLayout onNext={handleNext}>
      <div className="space-y-6">
        <p className="text-muted-foreground">{t("wizard.operatingCosts.intro")}</p>

        <Form {...form}>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {COST_CATEGORIES.map((category) => (
                <FormField
                  key={category.key}
                  control={form.control}
                  name={category.key}
                  render={({ field }) => (
                    <FormItem>
                      <Card className="h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <category.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <FormLabel className="font-medium">{t(category.labelKey)}</FormLabel>
                              <FormDescription className="text-xs">
                                {t(category.descriptionKey)}
                              </FormDescription>
                              <div className="mt-2">
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      min="0"
                                      step="10"
                                      className="pr-12"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseFloat(e.target.value) || 0)
                                      }
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                      {t("wizard.operatingCosts.perMonthShort")}
                                    </span>
                                  </div>
                                </FormControl>
                              </div>
                              <FormMessage />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </form>
        </Form>

        {/* Summary */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{t("wizard.operatingCosts.totalOperatingCosts")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("wizard.operatingCosts.monthlyFixedCosts")}
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
      </div>
    </WizardLayout>
  );
}
