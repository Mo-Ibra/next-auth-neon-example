"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || ""
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [canResend, setCanResend] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendCountdown === 0) {
      setCanResend(true)
    }
  }, [resendCountdown])

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

  async function handleResendCode() {
    if (!canResend) return

    setCanResend(false)
    setMessage("")
    setStatus("idle")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus("error")
        setMessage(data.error || "Failed to resend code")
        if (response.status === 429) {
          // Extract wait time from error message if available
          const match = data.error.match(/(\d+) seconds/)
          if (match) {
            setResendCountdown(parseInt(match[1]))
          } else {
            setResendCountdown(60)
          }
        } else {
          setCanResend(true)
        }
        return
      }

      setStatus("success")
      setMessage("Verification code sent! Check your email.")
      setResendCountdown(60) // Wait 60 seconds before allowing another resend
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        if (status !== "error") {
          setMessage("")
          setStatus("idle")
        }
      }, 3000)
    } catch (error) {
      setStatus("error")
      setMessage("Failed to resend verification code")
      setCanResend(true)
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
          {status === "success" && message.includes("successfully") ? (
            <>
              <Alert>
                <AlertDescription className="text-green-700">
                  {message}
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting to login...
              </p>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <Alert variant={status === "error" ? "destructive" : "default"}>
                    <AlertDescription>
                      {message}
                    </AlertDescription>
                  </Alert>
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

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Didn't receive the code?
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleResendCode}
                  disabled={!canResend || resendCountdown > 0}
                >
                  {resendCountdown > 0 
                    ? `Resend Code (${resendCountdown}s)` 
                    : "Resend Verification Code"}
                </Button>
                
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/signup">Back to Sign Up</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}