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

// Categories matching German Betriebskosten from Excel template
const COST_CATEGORIES = [
  {
    key: "rent",
    label: "Miete",
    description: "Büro, Coworking, Lager",
    icon: Home,
    defaultValue: 200,
  },
  {
    key: "telephoneInternet",
    label: "Telefon & Internet",
    description: "Festnetz, Mobil, DSL",
    icon: Phone,
    defaultValue: 10,
  },
  {
    key: "travelCosts",
    label: "Fahrt-/Reisekosten",
    description: "PKW, Benzin, Versicherung, Leasing",
    icon: Car,
    defaultValue: 150,
  },
  {
    key: "insurance",
    label: "Versicherungen",
    description: "Betriebshaftpflicht, etc.",
    icon: Shield,
    defaultValue: 20,
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Web, LinkedIn, Facebook, Werbung",
    icon: Megaphone,
    defaultValue: 350,
  },
  {
    key: "softwareLicenses",
    label: "Software Lizenzen",
    description: "Zoom, Microsoft, SaaS",
    icon: Laptop,
    defaultValue: 25,
  },
  {
    key: "accounting",
    label: "Steuerberater",
    description: "Buchhaltung, DATEV",
    icon: Calculator,
    defaultValue: 0,
  },
  {
    key: "officeSupplies",
    label: "Büromaterial",
    description: "Papier, Drucker, etc.",
    icon: FileText,
    defaultValue: 0,
  },
  {
    key: "chamberFees",
    label: "IHK Beiträge",
    description: "Industrie- und Handelskammer",
    icon: Building2,
    defaultValue: 0,
  },
  {
    key: "other",
    label: "Sonstiges",
    description: "Weitere laufende Kosten",
    icon: MoreHorizontal,
    defaultValue: 0,
  },
] as const;

export function OperatingCostsStep() {
  const { operatingCosts, updateOperatingCosts } = useWizardStore();

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
        <p className="text-muted-foreground">
          Geben Sie Ihre monatlichen Betriebskosten ein. Diese werden als Durchschnittswerte für die gesamte Planungsperiode verwendet.
        </p>

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
                              <FormLabel className="font-medium">{category.label}</FormLabel>
                              <FormDescription className="text-xs">
                                {category.description}
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
                                      €/Mon
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
                <h4 className="font-semibold">Gesamte Betriebskosten</h4>
                <p className="text-sm text-muted-foreground">
                  Monatliche Fixkosten (ohne Personal)
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {totalMonthly.toLocaleString("de-DE")} €
                </p>
                <p className="text-sm text-muted-foreground">
                  {(totalMonthly * 12).toLocaleString("de-DE")} €/Jahr
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
