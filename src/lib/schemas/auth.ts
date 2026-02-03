import { z } from "zod";
import type { TFunction } from "@/lib/i18n";

export const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein"),
});

export const registerSchema = z.object({
  displayName: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Die Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
});

export function getLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t("auth.validation.emailInvalid")),
    password: z.string().min(6, t("auth.validation.passwordMin")),
  });
}

export function getRegisterSchema(t: TFunction) {
  return z.object({
    displayName: z.string().min(2, t("auth.validation.nameMin")),
    email: z.string().email(t("auth.validation.emailInvalid")),
    password: z.string().min(6, t("auth.validation.passwordMin")),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.validation.passwordsMismatch"),
    path: ["confirmPassword"],
  });
}

export function getResetPasswordSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t("auth.validation.emailInvalid")),
  });
}

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
