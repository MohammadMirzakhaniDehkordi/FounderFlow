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
  CheckCircle2
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Calculator,
      title: "Automatische Berechnungen",
      description: "Körperschaftsteuer, Gewerbesteuer und UG-Rücklagen werden automatisch berechnet.",
    },
    {
      icon: FileText,
      title: "Bankfähige Exports",
      description: "Generieren Sie professionelle BWA und Liquiditätspläne im Standardformat.",
    },
    {
      icon: TrendingUp,
      title: "3-Jahres-Planung",
      description: "Planen Sie Ihre Finanzen über drei Jahre mit monatlicher Detailansicht.",
    },
    {
      icon: Building2,
      title: "UG-Spezifisch",
      description: "Speziell für deutsche UG entwickelt mit allen rechtlichen Anforderungen.",
    },
    {
      icon: Shield,
      title: "Sicher & Privat",
      description: "Ihre Finanzdaten sind verschlüsselt und nur für Sie zugänglich.",
    },
    {
      icon: Zap,
      title: "Einfache Bedienung",
      description: "Kein Excel-Wissen nötig. Beantworten Sie einfache Fragen.",
    },
  ];

  const benefits = [
    "Keine komplizierten Excel-Formeln mehr",
    "Automatische Steuerberechnung nach deutschem Recht",
    "Professionelle Dokumente für Ihre Bank",
    "Zeit sparen bei der Finanzplanung",
    "Immer aktuelle Berechnungen",
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
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button>Kostenlos starten</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Building2 className="h-4 w-4" />
            Speziell für deutsche UG
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Finanzplanung für Ihre UG{" "}
            <span className="text-primary">ohne Excel</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Erstellen Sie bankfähige BWA und Liquiditätspläne in Minuten. 
            Beantworten Sie einfache Fragen - wir kümmern uns um die Berechnungen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Jetzt kostenlos starten
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Demo ansehen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Alles was Sie brauchen</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            FounderFlow vereinfacht die Finanzplanung für UG-Gründer mit automatisierten Berechnungen und professionellen Exports.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
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
                Verabschieden Sie sich von komplizierten Excel-Tabellen
              </h2>
              <p className="text-muted-foreground mb-8">
                Unsere Interview-basierte Oberfläche führt Sie durch alle notwendigen Eingaben. 
                Sie müssen keine Formeln kennen - wir berechnen alles automatisch nach deutschem Steuerrecht.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
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
                    <p className="font-medium">Firma einrichten</p>
                    <p className="text-sm text-muted-foreground">Name, Stammkapital, Hebesatz</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Umsatz & Kosten eingeben</p>
                    <p className="text-sm text-muted-foreground">Personal, Miete, Marketing</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">PDF exportieren</p>
                    <p className="text-sm text-muted-foreground">BWA & Liquiditätsplan</p>
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
            <CardTitle className="text-2xl">Bereit für einfache Finanzplanung?</CardTitle>
            <CardDescription>
              Starten Sie kostenlos und erstellen Sie Ihren ersten Finanzplan in wenigen Minuten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Kostenlos registrieren
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FounderFlow. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
