"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || ""
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setMessage("")

    if (!code || code.length !== 6) {
      setStatus("error")
      setMessage("Please enter a valid 6-digit code")
      return
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus("error")
        setMessage(data.error || "Failed to verify email")
        return
      }

      setStatus("success")
      setMessage(data.message)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred during verification")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
          <CardDescription>
            Enter the verification code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" ? (
            <>
              <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm">
                {message}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting to login...
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {message}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Verification Code
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  disabled={status === "loading"}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your email
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={status === "loading" || code.length !== 6}
              >
                {status === "loading" ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}

          {status !== "success" && (
            <div className="space-y-2 text-center text-sm">
              <p className="text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Back to Sign Up</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
