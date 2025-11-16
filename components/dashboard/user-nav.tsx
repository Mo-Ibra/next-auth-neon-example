"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User } from "next-auth";

interface UserNavProps {
  user: User;
}

export function UserNav({ user }: UserNavProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">{user.email}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ redirectTo: "/" })}
      >
        Sign Out
      </Button>
    </div>
  );
}
