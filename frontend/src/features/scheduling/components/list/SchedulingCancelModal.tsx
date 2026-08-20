"use client";

import CommonButton from "@/components/ui/CommonButton";
import { FormModal } from "@/components/ui/FormModal";
import { useState } from "react";
import { ManagedScheduling } from "../../types/schedulingManagement";

interface SchedulingCancelModalProps {
  scheduling: ManagedScheduling;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (justification: string) => Promise<void>;
}

export default function SchedulingCancelModal({
  scheduling,
  isSubmitting,
  onClose,
  onConfirm,
}: SchedulingCancelModalProps) {
  const [justification, setJustification] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!justification.trim()) {
      setError("O motivo do cancelamento é obrigatório.");
      return;
    }

    setError("");
    await onConfirm(justification);
  };

  return (
    <FormModal
      isOpen
      title="Cancelar agendamento"
      onClose={isSubmitting ? () => undefined : onClose}
      footerActions={
        <>
          <CommonButton
            label="Voltar"
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="border border-[#e2ddd5] bg-[#faf7f0] text-[#6a6560] hover:bg-[#f3f0e5]"
          />
          <CommonButton
            label="Confirmar cancelamento"
            type="button"
            isLoading={isSubmitting}
            loadingLabel="Cancelando..."
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          />
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-stone-600">
          Você está prestes a cancelar o agendamento de{" "}
          <strong>{scheduling.studentName}</strong>. Por favor, informe o motivo
          do cancelamento.
        </p>

        <label className="flex flex-col gap-2 text-sm font-semibold text-[#4a4540]">
          Motivo do cancelamento
          <textarea
            value={justification}
            disabled={isSubmitting}
            rows={4}
            maxLength={300}
            placeholder="Ex.: Imprevisto institucional, a pedagoga precisará se ausentar."
            onChange={(event) => {
              setJustification(event.target.value);
              if (error) setError("");
            }}
            className={`w-full resize-none rounded-lg border bg-white px-3.5 py-3 text-sm font-normal text-stone-700 outline-none transition-colors placeholder:text-stone-400 ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-stone-300 focus:border-[#6bc4a6]"
            }`}
          />
        </label>

        <div className="flex min-h-5 items-center justify-between gap-4">
          <span className="text-xs font-medium text-red-500">{error}</span>
          <span className="text-xs text-stone-400">
            {justification.length}/300
          </span>
        </div>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          O aluno será notificado por e-mail e o horário ficará disponível
          novamente para outros agendamentos.
        </p>
      </div>
    </FormModal>
  );
}
