"use client";

import CommonButton from "@/components/ui/CommonButton";
import { RefreshCw } from "lucide-react";

interface ReportConflictModalProps {
  open: boolean;
  onReload: () => void;
  onCancel: () => void;
}

export function ReportConflictModal({
  open,
  onReload,
  onCancel,
}: ReportConflictModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-conflict-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_12px_45px_rgba(0,0,0,0.22)]"
      >
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <RefreshCw size={23} />
        </span>
        <h2 id="report-conflict-title" className="text-xl font-bold text-stone-800">
          Relatório atualizado por outra pessoa
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Suas alterações não foram gravadas para preservar a versão mais
          recente. Recarregue o relatório antes de continuar.
        </p>
        <div className="mt-7 flex justify-end gap-3">
          <CommonButton
            label="Cancelar"
            onClick={onCancel}
            className="border border-stone-200 bg-[#faf7f0] text-stone-600 hover:bg-stone-100"
          />
          <CommonButton label="Recarregar" onClick={onReload} />
        </div>
      </div>
    </div>
  );
}
