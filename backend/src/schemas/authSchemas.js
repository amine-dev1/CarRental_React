import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  phone: z.string().optional(),
  enterprise_name: z.string().min(2, "Le nom de l'entreprise est requis"),
  enterprise_address: z.string().optional(),
  registry_number: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  vat_number: z.string().optional(),
  enterprise_phone: z.string().optional(),
  plan: z.enum(["Standard", "Pro", "Enterprise"]),
});
