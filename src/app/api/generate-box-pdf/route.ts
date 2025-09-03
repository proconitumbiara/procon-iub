import { eq } from "drizzle-orm";
import jsPDF from "jspdf";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { archivedProcessesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const processFolderNumber = searchParams.get("processFolderNumber");

        if (!processFolderNumber) {
            return NextResponse.json({ error: "Número da caixa é obrigatório" }, { status: 400 });
        }

        // Buscar todos os processos da caixa
        const processes = await db.query.archivedProcessesTable.findMany({
            where: eq(archivedProcessesTable.processFolderNumber, processFolderNumber),
            columns: {
                caseNumber: true,
            },
            orderBy: (archivedProcessesTable, { asc }) => [asc(archivedProcessesTable.caseNumber)],
        });

        if (processes.length === 0) {
            return NextResponse.json({ error: "Nenhum processo encontrado nesta caixa" }, { status: 404 });
        }

        // Criar PDF
        const pdf = new jsPDF();

        // Configurações do PDF
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const lineHeight = 6;
        let yPosition = margin + 20;

        // Título
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Caixa " + processFolderNumber, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 20;

        // Lista de processos em 2 colunas
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Números dos Processos:", margin, yPosition);
        yPosition += 15;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);

        // Configurações das colunas
        const colWidth = (pageWidth - 2 * margin) / 2;
        const col1X = margin;
        const col2X = margin + colWidth;

        // Distribuir processos em 2 colunas de forma equilibrada
        const processesPerColumn = Math.ceil(processes.length / 2);

        processes.forEach((process, index) => {
            const colIndex = Math.floor(index / processesPerColumn);
            const rowIndex = index % processesPerColumn;

            let xPosition: number;
            switch (colIndex) {
                case 0:
                    xPosition = col1X;
                    break;
                case 1:
                    xPosition = col2X;
                    break;
                default:
                    xPosition = col1X;
            }

            const currentY = yPosition + (rowIndex * lineHeight);

            // Verificar se precisa de nova página
            if (currentY > pageHeight - margin - 20) {
                pdf.addPage();
                yPosition = margin + 20;
                const newRowIndex = index % processesPerColumn;
                const newCurrentY = yPosition + (newRowIndex * lineHeight);
                pdf.text(`${index + 1}. ${process.caseNumber}`, xPosition, newCurrentY);
            } else {
                pdf.text(`${index + 1}. ${process.caseNumber}`, xPosition, currentY);
            }
        });

        // Rodapé
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");
            pdf.text(
                `Página ${i} de ${totalPages} - Total de processos: ${processes.length}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: "center" }
            );
        }

        // Gerar buffer do PDF
        const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

        // Retornar PDF como download
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="processos-caixa-${processFolderNumber}.pdf"`,
                "Content-Length": pdfBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
