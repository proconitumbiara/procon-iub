"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth.client";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email ou senha inválidos" }),
  password: z.string().trim().min(8, { message: "Email ou senha inválidos" }),
})


const LoginForm = () => {
  const router = useRouter();
  const formLogin = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmitLogin(values: z.infer<typeof loginSchema>) {

    await authClient.signIn.email({
      email: values.email,
      password: values.password,
    }, {
      onSuccess: () => {
        toast.success("Login realizado com sucesso")
        router.push("/archiving")
      },
      onError: () => {
        toast.error("Email ou senha inválidos")
      }
    })
  }



  return (
    <div className="flex w-full h-full">
      {/* Lado esquerdo com logo */}
      <div className="flex items-center justify-center w-1/2 h-full bg-background">
        <Image src="/Logo.svg" alt="Logo" width={400} height={400} priority />
      </div>

      {/* Lado direito com card */}
      <div className="flex items-center justify-center w-1/2 h-full bg-background">
        <Card className="w-2/3 h-auto overflow-hidden">
          <CardContent className="p-6 md:p-8 text-center flex flex-col justify-center h-full">
            <Form {...formLogin}>
              <form onSubmit={formLogin.handleSubmit(onSubmitLogin)} className="space-y-4">
                <h1 className="text-2xl font-bold text-foreground">
                  Faça login
                </h1>
                <div className="space-y-4">
                  <FormField
                    control={formLogin.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu email" {...field} className="bg-background shadow-md focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formLogin.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="password"
                              placeholder="Digite sua senha"
                              {...field}
                              className="bg-background shadow-md focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground pr-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <CardFooter className="p-0">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formLogin.formState.isSubmitting}
                  >
                    {formLogin.formState.isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
            <Button variant="ghost" className="hover:bg-transparent font-extralight hover:text-primary hover:font-bold">
              <Link href="/sign-up">
                Cadastre-se no sistema
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginForm;