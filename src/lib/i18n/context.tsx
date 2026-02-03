"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "./types";
import { DEFAULT_LOCALE, STORAGE_KEY } from "./types";
import de from "./translations/de.json";
import en from "./translations/en.json";
import fa from "./translations/fa.json";

const translations: Record<Locale, Record<string, unknown>> = {
  de: de as Record<string, unknown>,
  en: en as Record<string, unknown>,
  fa: fa as Record<string, unknown>,
};

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

function createT(locale: Locale): TFunction {
  const dict = translations[locale] ?? translations[DEFAULT_LOCALE];
  return (key: string, params?: Record<string, string | number>) => {
    let value = getNested(dict as Record<string, unknown>, key);
    if (value === undefined) {
      value = getNested(translations[DEFAULT_LOCALE] as Record<string, unknown>, key) ?? key;
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = (value as string).replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return value as string;
  };
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === "de" || stored === "en" || stored === "fa")) {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale === "fa" ? "fa" : newLocale === "de" ? "de" : "en";
      document.documentElement.dir = newLocale === "fa" ? "rtl" : "ltr";
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    document.documentElement.lang = locale === "fa" ? "fa" : locale === "de" ? "de" : "en";
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale, mounted]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: createT(locale),
      dir: locale === "fa" ? "rtl" : "ltr",
    }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return ctx;
}
