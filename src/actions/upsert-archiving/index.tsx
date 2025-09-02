"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { archivedProcessesTable, logsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import {
    CreateTicketSchema,
    ErrorMessages,
    ErrorTypes,
    UpdateTicketSchema,
} from "./schema";

export const upsertArchivedProcess = actionClient
    .schema(UpdateTicketSchema.or(CreateTicketSchema))
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return {
                error: {
                    type: ErrorTypes.UNAUTHENTICATED,
                    message: ErrorMessages[ErrorTypes.UNAUTHENTICATED],
                },
            };
        }

        const userId = session.user.id;
        let processId: string;
        let actionType: "create" | "update";

        if ("id" in parsedInput) {
            // 🔹 Atualizar
            const existing = await db.query.archivedProcessesTable.findFirst({
                where: eq(archivedProcessesTable.id, parsedInput.id),
            });

            if (!existing) throw new Error("Processo não encontrado");

            // Verifica se outro processo já possui o mesmo caseNumber
            if (parsedInput.caseNumber) {
                const duplicate = await db.query.archivedProcessesTable.findFirst({
                    where: eq(archivedProcessesTable.caseNumber, parsedInput.caseNumber),
                });

                if (duplicate && duplicate.id !== parsedInput.id) {
                    return {
                        success: false,
                        error: {
                            type: "DUPLICATE",
                            message: "Já existe um arquivamento para este processo."
                        }
                    };
                }
            }

            await db
                .update(archivedProcessesTable)
                .set({
                    caseNumber: parsedInput.caseNumber ?? existing.caseNumber,
                    consumerName: parsedInput.consumerName,
                    supplierName: parsedInput.supplierName,
                    processFolderNumber: parsedInput.processFolderNumber,
                    numberOfPages: parsedInput.numberOfPages,
                    filingDate: parsedInput.filingDate
                        ? new Date(parsedInput.filingDate)
                        : existing.filingDate,
                    updatedAt: new Date(),
                })
                .where(eq(archivedProcessesTable.id, parsedInput.id));

            processId = parsedInput.id;
            actionType = "update";
        } else {
            // 🔹 Criar
            if (!parsedInput.caseNumber) {
                return {
                    error: {
                        type: ErrorTypes.DUPLICATE,
                        message: "Número de processo é obrigatório",
                    },
                };
            }

            const existingProcess = await db.query.archivedProcessesTable.findFirst({
                where: eq(archivedProcessesTable.caseNumber, parsedInput.caseNumber),
            });

            if (existingProcess) {
                return {
                    error: {
                        type: ErrorTypes.DUPLICATE,
                        message: `Número de processo ${parsedInput.caseNumber} já está cadastrado`,
                    },
                };
            }

            const [created] = await db
                .insert(archivedProcessesTable)
                .values({
                    caseNumber: parsedInput.caseNumber,
                    consumerName: parsedInput.consumerName,
                    supplierName: parsedInput.supplierName,
                    processFolderNumber: parsedInput.processFolderNumber,
                    numberOfPages: parsedInput.numberOfPages,
                    filingDate: parsedInput.filingDate
                        ? new Date(parsedInput.filingDate)
                        : new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning({ id: archivedProcessesTable.id });

            processId = created.id;
            actionType = "create";
        }

        // 🔹 Criar log
        await db.insert(logsTable).values({
            action: actionType,
            description:
                actionType === "create"
                    ? `Processo ${parsedInput.caseNumber} criado`
                    : `Processo ${parsedInput.caseNumber} atualizado`,
            userId,
            archivedProcessId: processId,
            createdAt: new Date(),
        });

        revalidatePath("/archiving");

        return { success: true, id: processId };
    });
