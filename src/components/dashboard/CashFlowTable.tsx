"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { MonthlyCalculation } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface CashFlowTableProps {
  data: Record<string, MonthlyCalculation>;
  startYear: number;
}

export function CashFlowTable({ data, startYear }: CashFlowTableProps) {
  const { t, locale } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(startYear.toString());
  const years = [startYear, startYear + 1, startYear + 2];
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";

  const yearData = Object.entries(data).filter(([month]) =>
    month.startsWith(selectedYear)
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(numberLocale, {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("cashflowTable.title")}</CardTitle>
            <CardDescription>{t("cashflowTable.desc")}</CardDescription>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">{t("cashflowTable.month")}</TableHead>
                <TableHead className="text-right">{t("cashflowTable.revenue")}</TableHead>
                <TableHead className="text-right">{t("cashflowTable.personnel")}</TableHead>
                <TableHead className="text-right">{t("cashflowTable.operatingCosts")}</TableHead>
                <TableHead className="text-right">{t("cashflowTable.loans")}</TableHead>
                <TableHead className="text-right">{t("cashflowTable.balance")}</TableHead>
                <TableHead className="text-right">{t("cashflowTable.accountBalance")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearData.map(([month, calc]) => {
                const monthNum = parseInt(month.split("-")[1]);
                const isNegative = calc.endBalance < 0;

                return (
                  <TableRow key={month}>
                    <TableCell className="sticky left-0 bg-background font-medium">
                      {t(`months.${monthNum}`)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      +{formatCurrency(calc.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(calc.personnelCosts)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(calc.operatingCosts)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(calc.loanPrincipal + calc.loanInterest)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${calc.netCashflow >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {calc.netCashflow >= 0 ? "+" : ""}
                      {formatCurrency(calc.netCashflow)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isNegative ? (
                        <Badge variant="destructive">
                          {formatCurrency(calc.endBalance)}
                        </Badge>
                      ) : (
                        <span className="font-semibold">
                          {formatCurrency(calc.endBalance)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
