"use client";

import Link from "next/link";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { signOut } from "next-auth/react";

export default function EmailVerified({ session }: any) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification Required</CardTitle>
          <CardDescription>
            Please verify your email address to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Your email <strong>{session.user.email}</strong> needs to be
              verified before you can access the dashboard.
            </AlertDescription>
          </Alert>
          <Button className="w-full" asChild>
            <Link
              href={`/verify-email?email=${encodeURIComponent(
                session.user.email!
              )}`}
            >
              Verify Email Now
            </Link>
          </Button>
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => signOut({ redirectTo: "/" })}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
