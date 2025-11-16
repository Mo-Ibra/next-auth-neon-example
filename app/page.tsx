import Link from "next/link"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const session = await auth()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Demo</CardTitle>
          <CardDescription>
            Modern Next.js authentication with Auth.js v5
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {session?.user ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Logged in as:</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="default" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Sign in or create an account to get started
              </p>
              <div className="flex gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="default" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
