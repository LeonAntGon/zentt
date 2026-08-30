"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EmailVerifyProvider } from "@/components/dashboard/EmailVerify";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
      <EmailVerifyProvider>
        <DashboardShell>{children}</DashboardShell>
      </EmailVerifyProvider>
    </AuthGuard>
    </AuthProvider>
  );
}
