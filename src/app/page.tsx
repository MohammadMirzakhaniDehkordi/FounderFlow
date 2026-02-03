"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calculator,
  FileText,
  TrendingUp,
  Building2,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    { icon: Calculator, titleKey: "landing.feature1Title", descKey: "landing.feature1Desc" },
    { icon: FileText, titleKey: "landing.feature2Title", descKey: "landing.feature2Desc" },
    { icon: TrendingUp, titleKey: "landing.feature3Title", descKey: "landing.feature3Desc" },
    { icon: Building2, titleKey: "landing.feature4Title", descKey: "landing.feature4Desc" },
    { icon: Shield, titleKey: "landing.feature5Title", descKey: "landing.feature5Desc" },
    { icon: Zap, titleKey: "landing.feature6Title", descKey: "landing.feature6Desc" },
  ];

  const benefits = [
    "landing.benefit1",
    "landing.benefit2",
    "landing.benefit3",
    "landing.benefit4",
    "landing.benefit5",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">FounderFlow</span>
          </div>
          <nav className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost">{t("landing.signIn")}</Button>
            </Link>
            <Link href="/register">
              <Button>{t("landing.getStarted")}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Building2 className="h-4 w-4" />
            {t("landing.badge")}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {t("landing.heroTitle")}{" "}
            <span className="text-primary">{t("landing.heroTitleHighlight")}</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("landing.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                {t("landing.ctaStart")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                {t("landing.ctaDemo")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("landing.featuresTitle")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.featuresSubtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t(feature.titleKey)}</CardTitle>
                <CardDescription>{t(feature.descKey)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                {t("landing.benefitsTitle")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t("landing.benefitsIntro")}
              </p>
              <ul className="space-y-4">
                {benefits.map((key, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">{t("landing.howTo1Title")}</p>
                    <p className="text-sm text-muted-foreground">{t("landing.howTo1Desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">{t("landing.howTo2Title")}</p>
                    <p className="text-sm text-muted-foreground">{t("landing.howTo2Desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">{t("landing.howTo3Title")}</p>
                    <p className="text-sm text-muted-foreground">{t("landing.howTo3Desc")}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto p-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t("landing.ctaCardTitle")}</CardTitle>
            <CardDescription>
              {t("landing.ctaCardDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                {t("landing.ctaRegister")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FounderFlow. {t("landing.footerRights")}</p>
        </div>
      </footer>
    </div>
  );
}
