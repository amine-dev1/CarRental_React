import { z } from "zod";

export const uploadSchema = z.object({
  fileName: z.string().min(1, "Le nom du fichier est requis"),
});
