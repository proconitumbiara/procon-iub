import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  DUPLICATE: "DUPLICATE"
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado.",
  [ErrorTypes.DUPLICATE]: "Já existe um arquivamento para este processo.",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const UpdateTicketSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  caseNumber: z.string().optional(),
  consumerName: z.string().optional(),
  supplierName: z.string().optional(),
  processFolderNumber: z.string().optional(),
  numberOfPages: z.number().optional(),
  filingDate: z.date().optional(),
});

export const CreateTicketSchema = z.object({
  caseNumber: z.string().min(1, "Número do processo é obrigatório"),
  consumerName: z.string().min(1, "Nome do consumidor é obrigatório"),
  supplierName: z.string().min(1, "Nome do fornecedor é obrigatório"),
  processFolderNumber: z.string().min(1, "Número da pasta do processo é obrigatório"),
  numberOfPages: z.number().min(1, "Número de páginas é obrigatório"),
  filingDate: z.date({
    required_error: "Data de arquivamento é obrigatória.",
    invalid_type_error: "Data inválida.",
  }),
});


export type UpdateTicketSchema = z.infer<typeof UpdateTicketSchema>;
export type CreateTicketSchema = z.infer<typeof CreateTicketSchema>;
