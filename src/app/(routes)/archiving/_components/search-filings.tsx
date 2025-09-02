"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CustomPagination } from "@/components/custom-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArchivedProcess } from "@/types/archived-process";

import UpdateArchivingForm from "./update-archiving-form";

interface ArchivedProcessSearchProps {
    filings: ArchivedProcess[];
}

export default function ArchivedProcessSearch({ filings }: ArchivedProcessSearchProps) {
    const [query, setQuery] = useState("");
    const [filteredResults, setFilteredResults] = useState<ArchivedProcess[]>([]);

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 25;
    const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

    // Ordena e seta os resultados iniciais
    useEffect(() => {
        const sorted = [...filings].sort(
            (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );
        setFilteredResults(sorted);
    }, [filings]);

    // Filtra localmente
    useEffect(() => {
        if (!query) {
            const sorted = [...filings].sort(
                (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
            );
            setFilteredResults(sorted);
        } else {
            const lowerQuery = query.toLowerCase();
            const filtered = filings.filter(
                (proc) =>
                    proc.caseNumber.toLowerCase().includes(lowerQuery) ||
                    proc.consumerName.toLowerCase().includes(lowerQuery) ||
                    proc.supplierName.toLowerCase().includes(lowerQuery) ||
                    proc.processFolderNumber.toLowerCase().includes(lowerQuery)
            );
            setFilteredResults(
                filtered.sort(
                    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
                )
            );
        }
        setCurrentPage(1); // Resetar para primeira página ao filtrar
    }, [query, filings]);

    const handleReset = () => setQuery("");

    const formatDate = (date?: Date | string | null) =>
        date ? new Date(date).toLocaleDateString() : "-";

    // Seleciona os resultados da página atual
    const paginatedResults = filteredResults.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
    );

    return (
        <div className="flex-1 h-full pr-4">
            <div className="flex gap-2 mb-4">
                <Input
                    placeholder="Buscar arquivamento por número, consumidor, fornecedor ou pasta"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button onClick={handleReset} variant="outline">
                    Resetar filtros
                </Button>
            </div>

            {/* Contador de resultados */}
            <p className="mb-4 text-muted-foreground">
                Total de arquivamentos: {filteredResults.length}
            </p>

            {paginatedResults.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {paginatedResults.map((proc) => (
                            <Card key={proc.id} className="bg-background">
                                <CardHeader>
                                    <CardTitle>Processo: {proc.caseNumber}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <div className="flex flex-col text-muted-foreground">
                                        <p className="font-semibold text-foreground">Consumidor</p>
                                        {proc.consumerName}
                                    </div>
                                    <div className="flex flex-col text-muted-foreground">
                                        <p className="font-semibold text-foreground">Fornecedor</p>
                                        {proc.supplierName}
                                    </div>

                                    {/* Botão de detalhes */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="secondary" size="sm" className="mt-2">
                                                Ver detalhes
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader>
                                                <DialogTitle>Detalhes do arquivamento</DialogTitle>
                                            </DialogHeader>

                                            <div className="flex flex-col gap-2 text-muted-foreground">
                                                <p><span className="font-semibold text-foreground">Número do processo:</span> {proc.caseNumber}</p>
                                                <p><span className="font-semibold text-foreground">Consumidor:</span> {proc.consumerName}</p>
                                                <p><span className="font-semibold text-foreground">Fornecedor:</span> {proc.supplierName}</p>
                                                <p><span className="font-semibold text-foreground">Pasta:</span> {proc.processFolderNumber}</p>
                                                <p><span className="font-semibold text-foreground">Páginas:</span> {proc.numberOfPages}</p>
                                                <p><span className="font-semibold text-foreground">Data de arquivamento:</span> {formatDate(proc.filingDate)}</p>
                                                <p><span className="font-semibold text-foreground">Última atualização:</span> {formatDate(proc.updatedAt)}</p>
                                            </div>

                                            {/* Botão de edição dentro do dialog */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="mt-4">
                                                        Editar
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[600px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Editar arquivamento {proc.caseNumber}</DialogTitle>
                                                    </DialogHeader>
                                                    <UpdateArchivingForm
                                                        process={proc}
                                                        onSuccess={() => toast.success("Arquivamento atualizado!")}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <CustomPagination
                            total={totalPages}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </>
            ) : (
                <p className="text-muted-foreground mt-4">Nenhum arquivamento encontrado.</p>
            )}
        </div>
    );
}
