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
import { useTranslation } from "@/lib/i18n";

const combinedSchema = companySchema.merge(planSchema);
type CombinedFormData = z.infer<typeof combinedSchema>;

export function CompanyStep() {
  const { company, plan, updateCompany, updatePlan } = useWizardStore();
  const { t } = useTranslation();

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
                  <FormLabel>{t("wizard.company.companyName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("wizard.company.companyNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormDescription>{t("wizard.company.companyNameDesc")}</FormDescription>
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
                  <FormLabel>{t("wizard.company.foundingDate")}</FormLabel>
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
                  <FormLabel>{t("wizard.company.stammkapital")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>{t("wizard.company.stammkapitalDesc")}</FormDescription>
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
                  <FormLabel>{t("wizard.company.hebesatz")}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("wizard.company.hebesatzPlaceholder")} />
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
                    {t("wizard.company.orEnterDirect")}{" "}
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
                  <FormLabel>{t("wizard.company.kontokorrent")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>{t("wizard.company.kontokorrentDesc")}</FormDescription>
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
                  <FormLabel>{t("wizard.company.startingLiquidity")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>{t("wizard.company.startingLiquidityDesc")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">{t("wizard.company.planDetails")}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Plan Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("wizard.company.planName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("wizard.company.planNamePlaceholder")} {...field} />
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
                    <FormLabel>{t("wizard.company.startYear")}</FormLabel>
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
                    <FormDescription>{t("wizard.company.planCovers3Years")}</FormDescription>
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
