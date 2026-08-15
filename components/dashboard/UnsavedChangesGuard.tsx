"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConfirmActionModal } from "@/components/dashboard/ConfirmActionModal";

export type UnsavedChangesGuardHandle = {
  tryLeave: (leave: () => void) => void;
};

type UnsavedChangesGuardProps = {
  dirty: boolean;
  saving?: boolean;
  onSave: () => Promise<boolean>;
  guardRef?: Ref<UnsavedChangesGuardHandle | null>;
};

export function UnsavedChangesGuard({
  dirty,
  saving = false,
  onSave,
  guardRef,
}: UnsavedChangesGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);
  const bypassRef = useRef(false);

  const requestLeave = useCallback(
    (leave: () => void) => {
      if (!dirty || bypassRef.current) {
        leave();
        return;
      }
      setPendingLeave(() => leave);
      setOpen(true);
    },
    [dirty]
  );

  useImperativeHandle(guardRef, () => ({ tryLeave: requestLeave }), [
    requestLeave,
  ]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty || bypassRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dirty || bypassRef.current) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("javascript:")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname) return;

      e.preventDefault();
      e.stopPropagation();
      requestLeave(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`);
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, pathname, requestLeave, router]);

  const close = () => {
    setOpen(false);
    setPendingLeave(null);
  };

  const handleSave = async () => {
    const ok = await onSave();
    if (!ok) return;
    bypassRef.current = true;
    const leave = pendingLeave;
    close();
    leave?.();
  };

  const handleLeaveWithoutSaving = () => {
    bypassRef.current = true;
    const leave = pendingLeave;
    close();
    leave?.();
  };

  return (
    <ConfirmActionModal
      open={open}
      title="¿Salir sin guardar?"
      body="Tenés cambios sin guardar. ¿Querés guardarlos antes de salir?"
      confirmLabel="Guardar"
      cancelLabel="Cancelar"
      extraLabel="Salir sin guardar"
      loading={saving}
      closeOnConfirm={false}
      onExtra={handleLeaveWithoutSaving}
      onConfirm={handleSave}
      onClose={close}
    />
  );
}
