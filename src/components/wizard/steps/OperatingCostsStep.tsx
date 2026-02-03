"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Scale, 
  Calculator,
  MoreHorizontal 
} from "lucide-react";

const COST_CATEGORIES = [
  {
    key: "rent",
    label: "Miete",
    description: "Büro, Coworking, Lager",
    icon: Home,
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Werbung, Social Media, SEO",
    icon: Megaphone,
  },
  {
    key: "insurance",
    label: "Versicherungen",
    description: "Haftpflicht, Cyber, etc.",
    icon: Shield,
  },
  {
    key: "software",
    label: "Software & Tools",
    description: "SaaS, Lizenzen, Hosting",
    icon: Laptop,
  },
  {
    key: "legal",
    label: "Rechtsberatung",
    description: "Anwälte, Verträge",
    icon: Scale,
  },
  {
    key: "accounting",
    label: "Buchhaltung",
    description: "Steuerberater, DATEV",
    icon: Calculator,
  },
  {
    key: "other",
    label: "Sonstiges",
    description: "Weitere laufende Kosten",
    icon: MoreHorizontal,
  },
] as const;

export function OperatingCostsStep() {
  const { operatingCosts, updateOperatingCosts } = useWizardStore();

  const form = useForm({
    defaultValues: {
      rent: operatingCosts.categories?.rent || 0,
      marketing: operatingCosts.categories?.marketing || 0,
      insurance: operatingCosts.categories?.insurance || 0,
      software: operatingCosts.categories?.software || 0,
      legal: operatingCosts.categories?.legal || 0,
      accounting: operatingCosts.categories?.accounting || 0,
      other: operatingCosts.categories?.other || 0,
    },
  });

  const values = form.watch();
  const totalMonthly = Object.values(values).reduce((sum, val) => sum + (val || 0), 0);

  const handleNext = () => {
    updateOperatingCosts({
      categories: {
        rent: values.rent,
        marketing: values.marketing,
        insurance: values.insurance,
        software: values.software,
        legal: values.legal,
        accounting: values.accounting,
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
