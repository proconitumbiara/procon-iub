import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { archivedProcessesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Buscar todas as caixas com contagem de processos
        const boxes = await db
            .select({
                processFolderNumber: archivedProcessesTable.processFolderNumber,
                processCount: sql<number>`count(*)`.as("processCount"),
            })
            .from(archivedProcessesTable)
            .groupBy(archivedProcessesTable.processFolderNumber)
            .orderBy(archivedProcessesTable.processFolderNumber);

        return NextResponse.json(boxes);

    } catch (error) {
        console.error("Erro ao buscar caixas:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
