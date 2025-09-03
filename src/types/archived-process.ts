export interface ArchivedProcess {
    id: string;
    caseNumber: string;
    consumerName: string;
    supplierName: string;
    processFolderNumber: string;
    numberOfPages: number;
    filingDate?: Date | null;
    status: "archived" | "filed_and_checked";
    createdAt?: Date | null;
    updatedAt?: Date | null;
}