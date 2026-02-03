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

export function PersonnelStep() {
  const { personnel, plan, addEmployee, removeEmployee, updateEmployee } = useWizardStore();
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
        <p className="text-muted-foreground">
          Fügen Sie alle geplanten Mitarbeiter hinzu, einschließlich Ihres eigenen Geschäftsführer-Gehalts.
        </p>

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
                            <Badge variant="secondary">Geschäftsführer</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ab {employee.startMonth} • {employee.monthlySalary.toLocaleString("de-DE")} €/Monat
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
                      <span className="font-medium">Gesamte Personalkosten</span>
                      <p className="text-sm text-muted-foreground">
                        {employees.length} Mitarbeiter
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {totalMonthlyCost.toLocaleString("de-DE")} €/Monat
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(totalMonthlyCost * 12).toLocaleString("de-DE")} €/Jahr
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
              <CardTitle className="text-lg">Neuen Mitarbeiter hinzufügen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Rolle / Position</Label>
                  <Input
                    id="role"
                    placeholder="z.B. Entwickler, Marketing Manager"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Monatsgehalt (Brutto) (€)</Label>
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
                  <Label htmlFor="startMonth">Startmonat</Label>
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
                    Geschäftsführer-Gehalt (nicht sozialversicherungspflichtig)
                  </Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddEmployee}>Hinzufügen</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Abbrechen
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
            Mitarbeiter hinzufügen
          </Button>
        )}

        {employees.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Mitarbeiter hinzugefügt.</p>
            <p className="text-sm">
              Klicken Sie auf "Mitarbeiter hinzufügen" um zu beginnen.
            </p>
          </div>
        )}
      </div>
    </WizardLayout>
  );
}
