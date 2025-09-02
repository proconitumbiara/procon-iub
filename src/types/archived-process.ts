export interface ArchivedProcess {
    id: string;
    caseNumber: string;
    consumerName: string;
    supplierName: string;
    processFolderNumber: string;
    numberOfPages: number;
    filingDate?: Date | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}