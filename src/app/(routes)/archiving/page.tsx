
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { ArchivedProcess } from "@/types/archived-process";

import GenerateBoxPDF from "./_components/generate-box-pdf";
import ArchivedProcessSearch from "./_components/search-filings";


const Home = async () => {

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/");
    }

    const filings = await db.query.archivedProcessesTable.findMany();

    // Cast dos dados para o tipo correto
    const typedFilings: ArchivedProcess[] = filings.map(filing => ({
        ...filing,
        status: filing.status as "archived" | "filed_and_checked"
    }));

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Arquivamento de processos</PageTitle>
                    <PageDescription>Registre e gerencie os processos arquivados.</PageDescription>
                </PageHeaderContent>
            </PageHeader>
            <PageContent>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-row justify-between">
                        <ArchivedProcessSearch filings={typedFilings} />
                    </div>
                    <div className="flex flex-row justify-start">
                        <GenerateBoxPDF />
                    </div>
                </div>
            </PageContent>
        </PageContainer>
    );
}

export default Home;