"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EmailVerifyProvider } from "@/components/dashboard/EmailVerify";
import { DashboardDataProvider } from "@/contexts/DashboardDataContext";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardDataProvider>
        <EmailVerifyProvider>
          <DashboardShell>{children}</DashboardShell>
        </EmailVerifyProvider>
      </DashboardDataProvider>
    </AuthGuard>
  );
}
