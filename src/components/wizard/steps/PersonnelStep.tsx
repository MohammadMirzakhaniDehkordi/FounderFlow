"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { WizardLayout } from "../WizardLayout";
import { useWizardStore } from "@/lib/store/wizardStore";
import type { Employee } from "@/lib/types";
import { Plus, Trash2, User, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function PersonnelStep() {
  const { personnel, plan, addEmployee, removeEmployee } = useWizardStore();
  const { t, locale } = useTranslation();
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";
  const [showForm, setShowForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    role: "",
    monthlySalary: 0,
    startMonth: `${plan.startYear}-01`,
    isGeschaeftsfuehrer: false,
  });

  const employees = personnel.employees || [];

  const handleAddEmployee = () => {
    if (!newEmployee.role || !newEmployee.monthlySalary) return;

    const employee: Employee = {
      id: crypto.randomUUID(),
      role: newEmployee.role,
      monthlySalary: newEmployee.monthlySalary,
      startMonth: newEmployee.startMonth || `${plan.startYear}-01`,
      isGeschaeftsfuehrer: newEmployee.isGeschaeftsfuehrer || false,
    };

    addEmployee(employee);
    setNewEmployee({
      role: "",
      monthlySalary: 0,
      startMonth: `${plan.startYear}-01`,
      isGeschaeftsfuehrer: false,
    });
    setShowForm(false);
  };

  const totalMonthlyCost = employees.reduce((sum, emp) => sum + emp.monthlySalary, 0);

  return (
    <WizardLayout>
      <div className="space-y-6">
        <p className="text-muted-foreground">{t("wizard.personnel.intro")}</p>

        {/* Employee List */}
        {employees.length > 0 && (
          <div className="space-y-3">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{employee.role}</span>
                          {employee.isGeschaeftsfuehrer && (
                            <Badge variant="secondary">{t("wizard.personnel.managingDirector")}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("wizard.personnel.employeeInfo", {
                            month: employee.startMonth,
                            amount: employee.monthlySalary.toLocaleString(numberLocale),
                            perMonth: t("common.perMonth"),
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmployee(employee.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                    <span className="font-medium">{t("wizard.personnel.totalCosts")}</span>
                      <p className="text-sm text-muted-foreground">
                      {employees.length} {t("wizard.personnel.employeesCount")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                    {totalMonthlyCost.toLocaleString(numberLocale)} {t("common.perMonth")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {(totalMonthlyCost * 12).toLocaleString(numberLocale)} {t("common.perYear")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Employee Form */}
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("wizard.personnel.addEmployee")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">{t("wizard.personnel.role")}</Label>
                  <Input
                    id="role"
                    placeholder={t("wizard.personnel.rolePlaceholder")}
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">{t("wizard.personnel.monthlySalary")}</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    step="100"
                    value={newEmployee.monthlySalary}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        monthlySalary: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="startMonth">{t("wizard.personnel.startMonth")}</Label>
                  <Input
                    id="startMonth"
                    type="month"
                    value={newEmployee.startMonth}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, startMonth: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="isGf"
                    checked={newEmployee.isGeschaeftsfuehrer}
                    onCheckedChange={(checked) =>
                      setNewEmployee({
                        ...newEmployee,
                        isGeschaeftsfuehrer: checked === true,
                      })
                    }
                  />
                  <Label htmlFor="isGf" className="text-sm">
                    {t("wizard.personnel.isManagingDirector")}
                  </Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddEmployee}>{t("common.add")}</Button>
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
            {t("wizard.personnel.addEmployee")}
          </Button>
        )}

        {employees.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("wizard.personnel.noEmployees")}</p>
            <p className="text-sm">{t("wizard.personnel.clickToAdd")}</p>
          </div>
        )}
      </div>
    </WizardLayout>
  );
}
