export interface ArchivedProcess {
    id: string;
    caseNumber: string;
    consumerName: string;
    supplierName: string;
    processFolderNumber: string;
    numberOfPages: number;
    filingDate: string; // Formato YYYY-MM-DD
    status: "archived" | "filed_and_checked";
    createdAt?: Date | null;
    updatedAt?: Date | null;
}