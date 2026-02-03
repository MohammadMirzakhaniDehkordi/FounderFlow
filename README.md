# FounderFlow - Finanzplanung für deutsche UG

Eine Web-Anwendung zur automatisierten Finanzplanung für deutsche Unternehmergesellschaften (UG). FounderFlow ersetzt komplexe Excel-Tabellen durch eine einfache, interviewbasierte Benutzeroberfläche.

## Features

- **Interview-basierte Eingabe**: Schritt-für-Schritt Assistent ohne Formeln
- **Automatische Berechnungen**: Körperschaftsteuer, Gewerbesteuer, Solidaritätszuschlag, UG-Rücklage
- **3-Jahres-Planung**: Monatliche Liquiditätsplanung über 3 Jahre
- **Bankfähige Exports**: BWA und Liquiditätsplan als PDF im Standardformat
- **Darlehensberechnung**: Tilgungspläne mit tilgungsfreier Zeit

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **State**: Zustand (lokal), React Query (Server)
- **Backend**: Firebase (Firestore, Auth, Cloud Functions)
- **Charts**: Recharts
- **PDF**: @react-pdf/renderer

## Erste Schritte

### Voraussetzungen

- Node.js 18+
- npm
- Firebase-Projekt

### Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd founderflow
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env.local
```

Tragen Sie Ihre Firebase-Konfiguration in `.env.local` ein:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. Entwicklungsserver starten:
```bash
npm run dev
```

Die Anwendung ist unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Firebase-Setup

### Firestore

Erstellen Sie eine Firestore-Datenbank und aktivieren Sie folgende Regeln:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /companies/{companyId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      
      match /plans/{planId} {
        allow read, write: if request.auth != null;
        
        match /{subcollection}/{document} {
          allow read, write: if request.auth != null;
        }
      }
    }
  }
}
```

### Authentication

Aktivieren Sie folgende Anmeldeverfahren:
- E-Mail/Passwort
- Google

## Projektstruktur

```
/src
  /app                    # Next.js App Router
    /(auth)               # Authentifizierungsseiten
    /(dashboard)          # Geschützte Seiten
  /components
    /ui                   # shadcn/ui Komponenten
    /wizard               # Wizard-Schritte
    /dashboard            # Dashboard-Komponenten
    /pdf                  # PDF-Templates
    /providers            # React Context Provider
  /lib
    /calculations         # Berechnungslogik
      /taxes.ts           # Steuerberechnungen
      /loans.ts           # Darlehensberechnungen
      /liquidity.ts       # Liquiditätsberechnung
      /bwa.ts             # BWA-Generierung
    /firebase             # Firebase-Konfiguration
    /store                # Zustand Store
    /schemas              # Zod Validierung
    /types                # TypeScript-Typen
    /utils                # Hilfsfunktionen
```

## Finanzielle Berechnungen

### Steuerberechnung für UG

```typescript
// Körperschaftsteuer: 15%
const koerperschaftsteuer = gewinn * 0.15;

// Solidaritätszuschlag: 5.5% der KSt
const solidaritaetszuschlag = koerperschaftsteuer * 0.055;

// Gewerbesteuer: Gewinn × 3.5% × (Hebesatz / 100)
// Hinweis: UG hat KEINEN Gewerbesteuerfreibetrag
const gewerbesteuer = gewinn * 0.035 * (hebesatz / 100);
```

### UG-Rücklage

Eine UG muss 25% des Jahresgewinns als Rücklage einbehalten, bis das Stammkapital 25.000€ erreicht:

```typescript
const ruecklage = Math.min(
  jahresgewinn * 0.25,
  Math.max(0, 25000 - aktuellesStammkapital)
);
```

## Scripts

```bash
npm run dev       # Entwicklungsserver
npm run build     # Produktions-Build
npm run start     # Produktions-Server
npm run lint      # ESLint
```

## Lizenz

MIT

## Beitragen

Pull Requests sind willkommen. Für größere Änderungen öffnen Sie bitte zuerst ein Issue.
