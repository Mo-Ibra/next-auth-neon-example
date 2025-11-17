import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserNav } from "@/components/dashboard/user-nav";
import EmailVerified from "@/components/dashboard/email-verified";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { emailVerified: true },
  });

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id },
    select: { provider: true },
  });

  if (!user?.emailVerified && !account?.provider) {
    return <EmailVerified session={session} />;
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <UserNav user={session.user} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>
                You're logged in and viewing your protected dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.user.image && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Image:</p>
                  <Image
                    src={session.user.image}
                    alt="Image"
                    width="100"
                    height="100"
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Name:</p>
                <p className="font-medium">{session.user.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email:</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">User ID:</p>
                <p className="font-mono text-sm">{session.user.id}</p>
              </div>
              {user?.emailVerified && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Email Verified:
                  </p>
                  <p className="text-green-600 font-medium">✓ Verified</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
