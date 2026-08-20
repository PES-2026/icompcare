"use client";

import CommonButton from "@/components/ui/CommonButton";
import { Field } from "@/components/ui/Field";
import { useState } from "react";

interface DeleteReportModalProps {
  open: boolean;
  isDeleting?: boolean;
  error?: string;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

export function DeleteReportModal({
  open,
  isDeleting = false,
  error,
  onConfirm,
  onCancel,
}: DeleteReportModalProps) {
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-report-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_12px_45px_rgba(0,0,0,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-report-title" className="text-xl font-bold text-stone-800">
          Excluir relatório
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Esta ação removerá o relatório das listagens. Informe sua senha para
          confirmar.
        </p>

        <div className="mt-5">
          <Field label="Senha atual" error={error} required>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && password && !isDeleting) {
                  onConfirm(password);
                }
              }}
              className={`w-full rounded-md border-[1.5px] px-3.5 py-2.5 text-sm outline-none ${
                error
                  ? "border-red-300 bg-red-50 focus:border-red-400"
                  : "border-stone-300 focus:border-[#6bc4a6]"
              }`}
            />
          </Field>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <CommonButton
            label="Cancelar"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="border border-stone-200 bg-[#faf7f0] text-stone-600 hover:bg-stone-100"
          />
          <CommonButton
            label={isDeleting ? "Excluindo..." : "Excluir"}
            type="button"
            onClick={() => onConfirm(password)}
            disabled={!password || isDeleting}
            className="bg-red-400 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
