"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { archivedProcessesTable } from "@/db/schema";
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

        await db
            .update(archivedProcessesTable)
            .set({
                status: "filed_and_checked",
            })
            .where(eq(archivedProcessesTable.id, parsedInput.id));


        revalidatePath("/archiving");
    });
