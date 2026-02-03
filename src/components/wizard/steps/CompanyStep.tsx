"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { companySchema, planSchema, CompanyFormData, PlanFormData } from "@/lib/schemas/wizard";
import { HEBESATZ_DATA } from "@/lib/calculations/taxes";
import { z } from "zod";

const combinedSchema = companySchema.merge(planSchema);
type CombinedFormData = z.infer<typeof combinedSchema>;

export function CompanyStep() {
  const { company, plan, updateCompany, updatePlan } = useWizardStore();

  const form = useForm<CombinedFormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      companyName: company.companyName || "",
      foundingDate: company.foundingDate || "",
      stammkapital: company.stammkapital || 1,
      hebesatz: company.hebesatz || 400,
      kontokorrent: company.kontokorrent || 0,
      name: plan.name || `Finanzplan ${new Date().getFullYear()}`,
      startYear: plan.startYear || new Date().getFullYear(),
      startingLiquidity: plan.startingLiquidity || 0,
    },
  });

  const cities = Object.entries(HEBESATZ_DATA).sort((a, b) => a[0].localeCompare(b[0]));

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const values = form.getValues();
      updateCompany({
        companyName: values.companyName,
        foundingDate: values.foundingDate,
        stammkapital: values.stammkapital,
        hebesatz: values.hebesatz,
        kontokorrent: values.kontokorrent,
      });
      updatePlan({
        name: values.name,
        startYear: values.startYear,
        startingLiquidity: values.startingLiquidity,
      });
    }
  };

  return (
    <WizardLayout onNext={handleNext} showBack={false}>
      <Form {...form}>
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firmenname</FormLabel>
                  <FormControl>
                    <Input placeholder="Meine UG (haftungsbeschränkt)" {...field} />
                  </FormControl>
                  <FormDescription>Der vollständige Name Ihrer UG</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Founding Date */}
            <FormField
              control={form.control}
              name="foundingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gründungsdatum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stammkapital */}
            <FormField
              control={form.control}
              name="stammkapital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stammkapital (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Mindestens 1€ für eine UG</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hebesatz */}
            <FormField
              control={form.control}
              name="hebesatz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gewerbesteuer-Hebesatz</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Stadt wählen oder Wert eingeben" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities.map(([city, rate]) => (
                        <SelectItem key={city} value={rate.toString()}>
                          {city} ({rate}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Oder direkt eingeben:{" "}
                    <Input
                      type="number"
                      className="inline-block w-20 h-6 text-xs"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 400)}
                      min="200"
                      max="900"
                    />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kontokorrent */}
            <FormField
              control={form.control}
              name="kontokorrent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontokorrentkredit (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Verfügbarer Überziehungsrahmen</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Starting Liquidity */}
            <FormField
              control={form.control}
              name="startingLiquidity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anfangsliquidität (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Bargeld/Bankguthaben zu Beginn</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">Planungsdetails</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Plan Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planname</FormLabel>
                    <FormControl>
                      <Input placeholder="Finanzplan 2026-2028" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Year */}
              <FormField
                control={form.control}
                name="startYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startjahr</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Der Plan umfasst 3 Jahre</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </WizardLayout>
  );
}
