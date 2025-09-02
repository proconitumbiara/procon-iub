
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container";
import { db } from "@/db";
import { auth } from "@/lib/auth";

import AddArchivingForm from "./_components/add-archiving-form";
import ArchivedProcessSearch from "./_components/search-filings";


const Home = async () => {

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/");
    }

    const filings = await db.query.archivedProcessesTable.findMany();

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Arquivamento de processos</PageTitle>
                    <PageDescription>Registre e gerencia os processos arquivados.</PageDescription>
                </PageHeaderContent>
            </PageHeader>
            <PageContent>
                <div className="flex flex-row justify-between">
                    <ArchivedProcessSearch filings={filings} />
                    <AddArchivingForm />
                </div>
            </PageContent>
        </PageContainer>
    );
}

export default Home;