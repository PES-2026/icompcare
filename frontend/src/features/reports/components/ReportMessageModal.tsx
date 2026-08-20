"use client";

import CommonButton from "@/components/ui/CommonButton";
import { AlertTriangle, FileQuestion, LockKeyhole } from "lucide-react";

type MessageVariant = "warning" | "not-found" | "forbidden";

interface ReportMessageModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
  title?: string;
  variant?: MessageVariant;
}

const icons = {
  warning: AlertTriangle,
  "not-found": FileQuestion,
  forbidden: LockKeyhole,
};

export function ReportMessageModal({
  open,
  message,
  onClose,
  title,
  variant = "warning",
}: ReportMessageModalProps) {
  if (!open) return null;
  const Icon = icons[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "report-message-title" : undefined}
        className="w-full max-w-lg rounded-2xl border border-[#ece7db] bg-[#faf7f0] p-7 text-center shadow-[0_12px_45px_rgba(0,0,0,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1d9] text-[#b77a20]">
          <Icon size={27} />
        </div>
        {title && (
          <h2 id="report-message-title" className="text-xl font-bold text-stone-800">
            {title}
          </h2>
        )}
        <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-stone-600">
          {message}
        </p>
        <CommonButton
          label="Voltar"
          onClick={onClose}
          className="mx-auto mt-7 min-w-48 justify-center"
        />
      </div>
    </div>
  );
}
