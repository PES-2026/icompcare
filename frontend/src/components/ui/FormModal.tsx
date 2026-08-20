"use client";

import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footerActions: ReactNode;
  onBack?: () => void;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
  onBack,
}: FormModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-6 flex items-center justify-center h-10">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 flex items-center justify-center rounded-full p-2 cursor-pointer text-[#a0998e] transition-colors hover:bg-[#ece7db] hover:text-[#3a3530]"
              title="Voltar"
              type="button"
            >
              <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
          )}

          <h2 className="m-0 text-2xl font-bold text-[#3a3530]">{title}</h2>
        </div>

        <div className="flex flex-col gap-4 mb-8">{children}</div>

        <div className="flex justify-end gap-3">{footerActions}</div>
      </div>
    </div>
  );
}
