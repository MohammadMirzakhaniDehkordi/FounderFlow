"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { generateBWA } from "@/lib/calculations/bwa";
import type { LiquidityResult } from "@/lib/calculations/liquidity";
import type { Company, BWAData } from "@/lib/types";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface StoredResult {
  company: Partial<Company>;
  plan: {
    name: string;
    startYear: number;
    startingLiquidity: number;
  };
  liquidityResult: LiquidityResult;
}

// Lazy load PDF components
function PdfDownloadButtons({ result, bwaData, t }: { result: StoredResult; bwaData: BWAData; t: (k: string) => string }) {
  const [PDFDownloadLink, setPDFDownloadLink] = useState<React.ComponentType<any> | null>(null);
  const [BWAPdfComponent, setBWAPdfComponent] = useState<React.ComponentType<any> | null>(null);
  const [LiquidityPdfComponent, setLiquidityPdfComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPdfComponents() {
      try {
        const [pdfRenderer, bwaPdf, liquidityPdf] = await Promise.all([
          import("@react-pdf/renderer"),
          import("@/components/pdf/BWAPdf"),
          import("@/components/pdf/LiquidityPdf"),
        ]);
        
        setPDFDownloadLink(() => pdfRenderer.PDFDownloadLink);
        setBWAPdfComponent(() => bwaPdf.BWAPdf);
        setLiquidityPdfComponent(() => liquidityPdf.LiquidityPdf);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load PDF components:", error);
        setIsLoading(false);
      }
    }
    
    loadPdfComponents();
  }, []);

  if (isLoading || !PDFDownloadLink || !BWAPdfComponent || !LiquidityPdfComponent) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("export.loadingPdf")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <PDFDownloadLink
        document={<BWAPdfComponent data={bwaData} />}
        fileName={`BWA_${result.company.companyName?.replace(/\s+/g, "_")}_${result.plan.startYear}.pdf`}
      >
        {({ loading }: { loading: boolean }) => (
          <Button variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t("export.downloadBWA")}
          </Button>
        )}
      </PDFDownloadLink>

      <PDFDownloadLink
        document={
          <LiquidityPdfComponent
            companyName={result.company.companyName || t("export.myUG")}
            startYear={result.plan.startYear}
            months={result.liquidityResult.months}
            yearSummaries={result.liquidityResult.yearSummaries}
            startingLiquidity={result.plan.startingLiquidity}
          />
        }
        fileName={`Liquiditaetsplan_${result.company.companyName?.replace(/\s+/g, "_")}_${result.plan.startYear}.pdf`}
      >
        {({ loading }: { loading: boolean }) => (
          <Button disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t("export.downloadLiquidity")}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
}

export default function ExportPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const numberLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";
  const [result, setResult] = useState<StoredResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("founderflow-result");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  const bwaData = useMemo<BWAData | null>(() => {
    if (!result) return null;

    return generateBWA({
      companyName: result.company.companyName || t("export.myUG"),
      startYear: result.plan.startYear,
      liquidityResult: result.liquidityResult,
    });
  }, [result, t]);

  if (!isClient || !result || !bwaData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("export.back")}
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-semibold">{t("export.pdfExport")}</h1>
              <p className="text-xs text-muted-foreground">{result.company.companyName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bwa">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="bwa">{t("export.bwaTab")}</TabsTrigger>
              <TabsTrigger value="liquidity">{t("export.liquidityTab")}</TabsTrigger>
            </TabsList>

            <PdfDownloadButtons result={result} bwaData={bwaData} t={t} />
          </div>

          <TabsContent value="bwa">
            <Card>
              <CardHeader>
                <CardTitle>{t("export.profitabilityTitle")}</CardTitle>
                <CardDescription>
                  {t("export.profitabilityDesc")} {result.plan.startYear} - {result.plan.startYear + 2}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* BWA Preview Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted">
                        <th className="text-left p-2 w-[25%]">{t("export.position")}</th>
                        <th className="text-right p-2">{t("common.year")} {bwaData.years[0]}</th>
                        <th className="text-right p-2 text-muted-foreground">%</th>
                        <th className="text-right p-2">{t("common.year")} {bwaData.years[1]}</th>
                        <th className="text-right p-2 text-muted-foreground">%</th>
                        <th className="text-right p-2">{t("common.year")} {bwaData.years[2]}</th>
                        <th className="text-right p-2 text-muted-foreground">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bwaData.rows.map((row, index) => {
                        const isHighlight = row.label.startsWith("=");
                        return (
                          <tr
                            key={index}
                            className={`border-b ${isHighlight ? "bg-muted/50 font-semibold" : ""}`}
                          >
                            <td className="p-2">{row.label}</td>
                            <td className={`text-right p-2 ${row.year1Value < 0 ? "text-red-600" : ""}`}>
                              {formatCurrency(row.year1Value)}
                            </td>
                            <td className="text-right p-2 text-muted-foreground">
                              {row.year1Percent.toFixed(1)}%
                            </td>
                            <td className={`text-right p-2 ${row.year2Value < 0 ? "text-red-600" : ""}`}>
                              {formatCurrency(row.year2Value)}
                            </td>
                            <td className="text-right p-2 text-muted-foreground">
                              {row.year2Percent.toFixed(1)}%
                            </td>
                            <td className={`text-right p-2 ${row.year3Value < 0 ? "text-red-600" : ""}`}>
                              {formatCurrency(row.year3Value)}
                            </td>
                            <td className="text-right p-2 text-muted-foreground">
                              {row.year3Percent.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  <p>{t("export.allValuesNote")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liquidity">
            <Card>
              <CardHeader>
                <CardTitle>{t("export.liquidityPlanTitle")}</CardTitle>
                <CardDescription>
                  {t("export.liquidityPlanDesc")} {result.plan.startYear} - {result.plan.startYear + 2}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {[0, 1, 2].map((yearOffset) => {
                    const year = result.plan.startYear + yearOffset;
                    const yearMonths = Object.entries(result.liquidityResult.months).filter(
                      ([m]) => m.startsWith(`${year}-`)
                    );
                    const summary = result.liquidityResult.yearSummaries[year];

                    return (
                      <div key={year}>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {t("common.year")} {year}
                        </h3>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <Card>
                            <CardContent className="p-3">
                              <p className="text-xs text-muted-foreground">{t("export.openingBalance")}</p>
                              <p className="font-semibold">
                                {formatCurrency(yearMonths[0]?.[1]?.startBalance || 0)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-3">
                              <p className="text-xs text-muted-foreground">{t("export.revenue")}</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(summary?.totalRevenue || 0)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-3">
                              <p className="text-xs text-muted-foreground">{t("export.expenses")}</p>
                              <p className="font-semibold text-red-600">
                                {formatCurrency(summary?.totalCosts || 0)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-3">
                              <p className="text-xs text-muted-foreground">{t("export.closingBalance")}</p>
                              <p className={`font-semibold ${(summary?.endLiquidity || 0) < 0 ? "text-red-600" : ""}`}>
                                {formatCurrency(summary?.endLiquidity || 0)}
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted">
                                <th className="text-left p-2">{t("export.month")}</th>
                                <th className="text-right p-2">{t("export.revenue")}</th>
                                <th className="text-right p-2">{t("export.expenses")}</th>
                                <th className="text-right p-2">{t("common.balance")}</th>
                                <th className="text-right p-2">{t("common.accountBalance")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {yearMonths.map(([month, calc]) => (
                                <tr key={month} className="border-b">
                                  <td className="p-2">{month}</td>
                                  <td className="text-right p-2 text-green-600">
                                    +{formatCurrency(calc.revenue)}
                                  </td>
                                  <td className="text-right p-2 text-red-600">
                                    -{formatCurrency(calc.totalOutflows)}
                                  </td>
                                  <td className={`text-right p-2 ${calc.netCashflow < 0 ? "text-red-600" : "text-green-600"}`}>
                                    {calc.netCashflow >= 0 ? "+" : ""}{formatCurrency(calc.netCashflow)}
                                  </td>
                                  <td className={`text-right p-2 font-medium ${calc.endBalance < 0 ? "text-red-600" : ""}`}>
                                    {formatCurrency(calc.endBalance)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
