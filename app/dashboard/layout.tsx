"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EmailVerifyProvider } from "@/components/dashboard/EmailVerify";
import { useAuth } from "@/contexts/AuthContext";

function DashboardProfileSync({ children }: { children: React.ReactNode }) {
  const { checkCurrentUser } = useAuth();

  useEffect(() => {
    void checkCurrentUser();
  }, [checkCurrentUser]);

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardProfileSync>
        <EmailVerifyProvider>
          <DashboardShell>{children}</DashboardShell>
        </EmailVerifyProvider>
      </DashboardProfileSync>
    </AuthGuard>
  );
}
