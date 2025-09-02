"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

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
            setFilteredResults([...filings].sort(
                (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
            ));
        } else {
            const lowerQuery = query.toLowerCase();
            const filtered = filings.filter(
                (proc) =>
                    proc.caseNumber.toLowerCase().includes(lowerQuery) ||
                    proc.consumerName.toLowerCase().includes(lowerQuery) ||
                    proc.supplierName.toLowerCase().includes(lowerQuery) ||
                    proc.processFolderNumber.toLowerCase().includes(lowerQuery)
            );
            setFilteredResults(filtered.sort(
                (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
            ));
        }
    }, [query, filings]);

    const handleReset = () => setQuery("");

    const formatDate = (date?: Date | string | null) =>
        date ? new Date(date).toLocaleDateString() : "-";

    return (
        <div className="flex-1 h-full pr-4">
            <div className="flex gap-2 mb-4">
                <Input
                    placeholder="Buscar arquivamento por número, consumidor, fornecedor ou pasta"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button onClick={handleReset} variant="outline">
                    Resetar busca
                </Button>
            </div>

            {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filteredResults.map((proc) => (
                        <Card key={proc.id} className="bg-background">
                            <CardHeader>
                                <CardTitle>Processo: {proc.caseNumber}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <div className="flex flex-col text-muted-foreground">
                                    <p className="font-semibold text-foreground">Consumidor</p> {proc.consumerName}
                                </div>
                                <div className="flex flex-col text-muted-foreground">
                                    <p className="font-semibold text-foreground">Fornecedor</p> {proc.supplierName}
                                </div>
                                <div className="flex flex-row gap-1 text-muted-foreground">
                                    <p className="font-semibold text-foreground">Pasta:</p> {proc.processFolderNumber}
                                </div>
                                <div className="flex flex-row gap-1 text-muted-foreground">
                                    <p className="font-semibold text-foreground">Páginas:</p> {proc.numberOfPages}
                                </div>
                                <div className="flex flex-row gap-1 text-muted-foreground">
                                    <p className="font-semibold text-foreground">Data de arquivamento:</p>{formatDate(proc.filingDate)}
                                </div>
                                <div className="flex flex-row gap-1 text-muted-foreground">
                                    <p className="font-semibold text-foreground">Última atualização em:</p>{formatDate(proc.updatedAt)}
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="mt-2">
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground mt-4">Nenhum arquivamento encontrado.</p>
            )}
        </div>
    );
}
