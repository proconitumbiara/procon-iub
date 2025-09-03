"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { checkArquiving } from "@/actions/filing-conference";
import { CustomPagination } from "@/components/custom-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArchivedProcess } from "@/types/archived-process";

import UpdateArchivingForm from "./update-archiving-form";

interface ArchivedProcessSearchProps {
    filings: ArchivedProcess[];
}

export default function ArchivedProcessSearch({ filings }: ArchivedProcessSearchProps) {
    const [query, setQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedBox, setSelectedBox] = useState<string>("all");
    const [filteredResults, setFilteredResults] = useState<ArchivedProcess[]>([]);

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 25;
    const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

    // Extrair todas as caixas únicas dos arquivamentos
    const uniqueBoxes = Array.from(
        new Set(filings.map(proc => proc.processFolderNumber))
    ).sort();

    // Ordena e seta os resultados iniciais
    useEffect(() => {
        const sorted = [...filings].sort(
            (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );
        setFilteredResults(sorted);
    }, [filings]);

    // Filtra localmente
    useEffect(() => {
        let filtered = [...filings];

        // Filtro por texto (nomes e número do processo)
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(
                (proc) =>
                    proc.caseNumber.toLowerCase().includes(lowerQuery) ||
                    proc.consumerName.toLowerCase().includes(lowerQuery) ||
                    proc.supplierName.toLowerCase().includes(lowerQuery)
            );
        }

        // Filtro por data de arquivamento
        if (selectedDate) {
            filtered = filtered.filter((proc) => {
                // Agora filingDate é sempre string no formato YYYY-MM-DD
                return proc.filingDate === selectedDate;
            });
        }

        // Filtro por caixa
        if (selectedBox && selectedBox !== "all") {
            filtered = filtered.filter((proc) => proc.processFolderNumber === selectedBox);
        }

        // Ordena por data de criação (mais recente primeiro)
        const sorted = filtered.sort(
            (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );

        setFilteredResults(sorted);
        setCurrentPage(1); // Resetar para primeira página ao filtrar
    }, [query, selectedDate, selectedBox, filings]);

    const handleReset = () => {
        setQuery("");
        setSelectedDate("");
        setSelectedBox("all");
    };

    const handleCheckArchiving = async (id: string) => {
        try {
            await checkArquiving({ id });
            toast.success("Arquivamento marcado como conferido!");
        } catch {
            toast.error("Erro ao marcar como conferido");
        }
    };

    const formatDate = (date?: string | Date | null) => {
        if (!date) return "-";

        // Se for string (formato YYYY-MM-DD), converte diretamente
        if (typeof date === 'string') {
            const [year, month, day] = date.split('-');
            return `${day}/${month}/${year}`;
        }

        // Se for Date object (para createdAt/updatedAt), formata normalmente
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // Seleciona os resultados da página atual
    const paginatedResults = filteredResults.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
    );

    return (
        <div className="flex-1 h-full pr-4">
            <div className="flex flex-col gap-4 mb-4">
                {/* Filtro de texto */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Buscar por número do processo, consumidor ou fornecedor"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={handleReset} variant="outline">
                        Resetar filtros
                    </Button>
                </div>

                {/* Filtros de data e caixa */}
                <div className="flex gap-4">
                    {/* Filtro de data */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-muted-foreground">
                            Data de arquivamento
                        </label>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-[200px]"
                            placeholder="Selecionar data"
                        />
                    </div>

                    {/* Filtro de caixa */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-muted-foreground">
                            Caixa
                        </label>
                        <Select value={selectedBox} onValueChange={setSelectedBox}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Todas as caixas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as caixas</SelectItem>
                                {uniqueBoxes.map((box) => (
                                    <SelectItem key={box} value={box}>
                                        {box}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Contador de resultados */}
            <p className="mb-4 text-muted-foreground text-xs">
                Total de arquivamentos registrados no sistema: {filteredResults.length}
            </p>

            {paginatedResults.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {paginatedResults.map((proc) => (
                            <Card key={proc.id} className="bg-background">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle>Processo: {proc.caseNumber}</CardTitle>
                                        <Badge
                                            variant={proc.status === "archived" ? "destructive" : "default"}
                                            className={proc.status === "filed_and_checked" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                                        >
                                            {proc.status === "archived" ? "Pendente" : "Conferido"}
                                        </Badge>
                                    </div>
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

                                    {/* Botão de conferência */}
                                    <Button
                                        onClick={() => proc.status === "archived" && handleCheckArchiving(proc.id)}
                                        variant="default"
                                        size="sm"
                                        className="mt-2 text-white"
                                        disabled={proc.status === "filed_and_checked"}
                                    >
                                        {proc.status === "archived" ? "Marcar como conferido" : "Arquivamento conferido"}
                                    </Button>

                                    {/* Botão de detalhes */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="mt-2">
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
                                                <p><span className="font-semibold text-foreground">Caixa:</span> {proc.processFolderNumber}</p>
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
