"use client";

import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface BoxOption {
    processFolderNumber: string;
    processCount: number;
}

export default function GenerateBoxPDF() {
    const [boxes, setBoxes] = useState<BoxOption[]>([]);
    const [selectedBox, setSelectedBox] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBoxes, setIsLoadingBoxes] = useState(true);

    // Carregar lista de caixas
    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                const response = await fetch("/api/archiving/boxes");
                if (response.ok) {
                    const data = await response.json();
                    setBoxes(data);
                } else {
                    toast.error("Erro ao carregar lista de caixas");
                }
            } catch (error) {
                console.error("Erro ao buscar caixas:", error);
                toast.error("Erro ao carregar lista de caixas");
            } finally {
                setIsLoadingBoxes(false);
            }
        };

        fetchBoxes();
    }, []);

    const handleGeneratePDF = async () => {
        if (!selectedBox) {
            toast.error("Selecione uma caixa");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/generate-box-pdf?processFolderNumber=${selectedBox}`);

            if (response.ok) {
                // Criar blob e fazer download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `processos-caixa-${selectedBox}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                toast.success("PDF gerado com sucesso!");
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Erro ao gerar PDF");
            }
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast.error("Erro ao gerar PDF");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedBoxInfo = boxes.find(box => box.processFolderNumber === selectedBox);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Gerar PDF de Processos por Caixa
                </CardTitle>
                <CardDescription>
                    Selecione uma caixa para gerar um PDF com todos os números de processo
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Selecionar Caixa</label>
                    <Select
                        value={selectedBox}
                        onValueChange={setSelectedBox}
                        disabled={isLoadingBoxes}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={isLoadingBoxes ? "Carregando caixas..." : "Selecione uma caixa"} />
                        </SelectTrigger>
                        <SelectContent>
                            {boxes.map((box) => (
                                <SelectItem key={box.processFolderNumber} value={box.processFolderNumber}>
                                    Caixa {box.processFolderNumber} ({box.processCount} processos)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedBoxInfo && (
                    <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">
                            <strong>Caixa selecionada:</strong> {selectedBoxInfo.processFolderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <strong>Total de processos:</strong> {selectedBoxInfo.processCount}
                        </p>
                    </div>
                )}

                <Button
                    onClick={handleGeneratePDF}
                    disabled={!selectedBox || isLoading || isLoadingBoxes}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Gerando PDF...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2" />
                            Gerar e Baixar PDF
                        </>
                    )}
                </Button>

                {selectedBoxInfo && (
                    <p className="text-xs text-muted-foreground text-center">
                        O PDF conterá apenas os números dos processos da caixa {selectedBoxInfo.processFolderNumber}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
