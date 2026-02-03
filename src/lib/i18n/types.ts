export type Locale = "de" | "en" | "fa";

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
];

export const DEFAULT_LOCALE: Locale = "de";

export const STORAGE_KEY = "founderflow-locale";
