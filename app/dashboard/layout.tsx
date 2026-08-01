"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
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
        <DashboardShell>{children}</DashboardShell>
      </DashboardProfileSync>
    </AuthGuard>
  );
}
