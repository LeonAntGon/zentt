"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EmailVerifyProvider } from "@/components/dashboard/EmailVerify";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <EmailVerifyProvider>
        <DashboardShell>{children}</DashboardShell>
      </EmailVerifyProvider>
    </AuthGuard>
  );
}
