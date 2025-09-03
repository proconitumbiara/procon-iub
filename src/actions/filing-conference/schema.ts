import { z } from "zod";

export const CheckArchivingSchema = z.object({
    id: z.string().min(1, "ID é obrigatório"),
});

export type CheckArchivingSchema = z.infer<typeof CheckArchivingSchema>;
