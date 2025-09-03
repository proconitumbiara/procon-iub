"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { archivedProcessesTable, logsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { CheckArchivingSchema } from "./schema";

export const checkArquiving = actionClient
    .schema(CheckArchivingSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Usuário não autenticado");
        }

        const userId = session.user.id;

        // Buscar informações do processo antes de atualizar
        const existing = await db.query.archivedProcessesTable.findFirst({
            where: eq(archivedProcessesTable.id, parsedInput.id),
        });

        if (!existing) {
            throw new Error("Processo não encontrado");
        }

        await db
            .update(archivedProcessesTable)
            .set({
                status: "filed_and_checked",
            })
            .where(eq(archivedProcessesTable.id, parsedInput.id));

        // 🔹 Criar log
        await db.insert(logsTable).values({
            action: "conference",
            description: `Processo ${existing.caseNumber} conferido e arquivado`,
            userId,
            archivedProcessId: parsedInput.id,
            createdAt: new Date(),
        });

        revalidatePath("/archiving");
    });
