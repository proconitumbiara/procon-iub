import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import LoginForm from "./_components/login-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user) {
    redirect("/archiving")
  }

  return (
    <div className="bg-background flex h-screen items-center justify-center">
      <LoginForm />
    </div>
  );
}

export default AuthenticationPage;