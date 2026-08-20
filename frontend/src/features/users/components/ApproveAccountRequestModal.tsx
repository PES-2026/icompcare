"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import CommonButton from "@/components/ui/CommonButton";
import { PendingAccountRequestItem, UserRole } from "../types/user";

interface ApproveAccountRequestModalProps {
  request: PendingAccountRequestItem;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (role: UserRole) => void;
}

const roleOptions: {
  value: UserRole;
  label: string;
  description: string;
  isAvailable: boolean;
}[] = [
  {
    value: "PROFESSOR",
    label: "Professor(a)",
    description: "Tem acesso aos relatórios dos alunos vinculados a ele.",
    isAvailable: true,
  },
  {
    value: "PEDAGOGUE",
    label: "Pedagogo(a)",
    description: "Tem acesso às funcionalidades de administrador do sistema.",
    isAvailable: true,
  },
];

export default function ApproveAccountRequestModal({
  request,
  isLoading,
  onClose,
  onConfirm,
}: ApproveAccountRequestModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("PEDAGOGUE");

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 transition-opacity"
      onClick={handleClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-account-request-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-stone-900/5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-5 text-center sm:px-8">
          <h2
            id="approve-account-request-title"
            className="text-xl font-bold text-stone-800"
          >
            Aprovar acesso
          </h2>
          <p className="mt-1.5 text-sm text-stone-500">
            Defina o nível de acesso para <strong>{request.name}</strong>
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <fieldset className="flex flex-col gap-3" disabled={isLoading}>
            <legend className="sr-only">Papel do usuário no sistema</legend>

            {roleOptions.map((option) => {
              const isSelected = selectedRole === option.value;
              const isDisabled = !option.isAvailable || isLoading;

              return (
                <label
                  key={option.value}
                  className={`group relative flex items-center justify-between rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2 ${
                    isSelected
                      ? "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500"
                      : isDisabled
                        ? "border-stone-200 bg-stone-50"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                  } ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  <input
                    type="radio"
                    name="approval-role"
                    value={option.value}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => {
                      if (!isDisabled) setSelectedRole(option.value);
                    }}
                    className="sr-only"
                  />

                  <div className="flex flex-col pr-4">
                    <span
                      className={`text-sm font-bold ${
                        isSelected ? "text-teal-900" : "text-stone-700"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={`mt-1 text-xs leading-relaxed ${
                        isSelected ? "text-teal-700/90" : "text-stone-500"
                      }`}
                    >
                      {option.description}
                    </span>
                  </div>

                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isSelected
                        ? "border-teal-500 bg-teal-500"
                        : "border-stone-300 bg-white group-hover:border-stone-400"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </label>
              );
            })}
          </fieldset>
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-stone-100 bg-stone-50/50 px-6 py-5 sm:flex-row sm:px-8">
          <CommonButton
            type="button"
            label="Cancelar"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full justify-center bg-[#f4a598] text-white hover:bg-[#f0a195] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-30"
          />

          <CommonButton
            type="button"
            label={isLoading ? "Aprovando..." : "Confirmar aprovação"}
            startIcon={isLoading ? Loader2 : undefined}
            onClick={() => onConfirm(selectedRole)}
            disabled={isLoading}
            className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-40 [&_svg]:animate-spin"
          />
        </div>
      </section>
    </div>
  );
}
