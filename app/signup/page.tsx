import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignupForm />
    </main>
  );
}
