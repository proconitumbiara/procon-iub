"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth.client";
import { formatName } from "@/lib/utils";

const registerSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
    email: z.string().trim().email({ message: "Email inválido" }),
    password: z
        .string()
        .trim()
        .min(8, { message: "Senha é obrigatória e deve ter pelo menos 8 caracteres" }),
});

export function SignUpForm() {
    const router = useRouter();

    const formRegister = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmitRegister(values: z.infer<typeof registerSchema>) {
        try {
            await authClient.signUp.email(
                {
                    email: values.email,
                    password: values.password,
                    name: values.name,
                },
                {
                    onSuccess: () => {
                        toast.success("Cadastro realizado com sucesso!");
                        router.push("/"); // redireciona para login
                    },
                    onError: (ctx) => {
                        if (
                            ctx.error.code === "USER_ALREADY_EXISTS" ||
                            ctx.error.code === "EMAIL_ALREADY_EXISTS"
                        ) {
                            toast.error("Email já cadastrado, por favor faça login");
                        } else {
                            toast.error("Erro ao cadastrar, tente novamente");
                        }
                    },
                }
            );
        } catch {
            toast.error("Erro ao realizar cadastro");
        }
    }

    return (
        <div className="flex w-full h-full">
            {/* Lado esquerdo com logo */}
            <div className="flex items-center justify-center w-1/2 h-ful">
                <Image src="/Logo.svg" alt="Logo" width={400} height={400} priority />
            </div>

            {/* Lado direito com card */}
            <div className="flex items-center justify-center w-1/2 h-full">
                <Card className="w-2/3 h-auto overflow-hidden">
                    <CardContent className="p-6 md:p-8 text-center flex flex-col justify-center h-full">
                        <Form {...formRegister}>
                            <form
                                onSubmit={formRegister.handleSubmit(onSubmitRegister)}
                                className="flex flex-col gap-6 h-full justify-center"
                            >
                                <h1 className="text-2xl font-bold text-foreground">
                                    Cadastro de Usuário
                                </h1>

                                <FormField
                                    control={formRegister.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome:</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Digite seu nome"
                                                    onBlur={(e) => {
                                                        const formattedValue = formatName(e.target.value);
                                                        field.onChange(formattedValue);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={formRegister.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email:</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Digite seu email" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={formRegister.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha:</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="Crie sua senha"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={formRegister.formState.isSubmitting}
                                >
                                    {formRegister.formState.isSubmitting ? "Cadastrando..." : "Cadastrar"}
                                </Button>
                            </form>
                        </Form>
                        <Button variant="ghost" className="hover:bg-transparent font-extralight hover:text-primary hover:font-bold">
                            <Link href="/">
                                Fazer login no sistema
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
