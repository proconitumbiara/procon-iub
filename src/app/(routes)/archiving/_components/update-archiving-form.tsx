"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertArchivedProcess } from "@/actions/upsert-archiving";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArchivedProcess } from "@/types/archived-process";

const formSchema = z.object({
    caseNumber: z.string().min(1, "Obrigatório"),
    consumerName: z.string().min(1, "Obrigatório"),
    supplierName: z.string().min(1, "Obrigatório"),
    processFolderNumber: z.string().min(1, "Obrigatório"),
    numberOfPages: z.coerce.number().min(1, "Obrigatório"),
    filingDate: z.date({ required_error: "Obrigatório" }),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateArchivedProcessFormProps {
    process: ArchivedProcess;
    onSuccess?: () => void;
}

export default function UpdateArchivedProcessForm({ process, onSuccess }: UpdateArchivedProcessFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            caseNumber: process.caseNumber,
            consumerName: process.consumerName,
            supplierName: process.supplierName,
            processFolderNumber: process.processFolderNumber,
            numberOfPages: process.numberOfPages,
            filingDate: process.filingDate || new Date(),
        },
    });

    const { execute, status } = useAction(upsertArchivedProcess, {
        onSuccess: () => {
            form.reset();
            onSuccess?.();
        },
        onError: () => toast.error("Erro ao atualizar arquivamento."),
    });

    const onSubmit = (values: FormValues) => execute({ ...values, id: process.id });

    return (
        <div className="flex flex-col w-full h-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="caseNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nº do Processo</FormLabel>
                                <FormControl>
                                    <Input placeholder="0001234-56.2025.8.26.0000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="consumerName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Consumidor</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nome do consumidor"
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .toLowerCase()
                                                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitaliza
                                            field.onChange(value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="supplierName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fornecedor</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nome do fornecedor"
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .toLowerCase()
                                                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitaliza
                                            field.onChange(value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="processFolderNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nº da Pasta</FormLabel>
                                <FormControl>
                                    <Input placeholder="Número da pasta" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="numberOfPages"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantidade de Páginas</FormLabel>
                                <FormControl>
                                    <Input type="number" min={1} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="filingDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={field.value ? field.value.toISOString().split("T")[0] : ""}
                                        onChange={(e) =>
                                            field.onChange(e.target.value ? new Date(e.target.value) : null)
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={status === "executing"} className="w-full text-white">
                        {status === "executing" ? "Salvando..." : "Atualizar"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};
