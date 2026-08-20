"use client";

import CommonButton from "@/components/ui/CommonButton";
import { FormModal } from "@/components/ui/FormModal";
import { useState } from "react";
import { ScheduleItem } from "../../types/schedulingManagement";

interface SchedulingRejectionModalProps {
  scheduling: ScheduleItem;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (justification: string) => Promise<void>;
}

export default function SchedulingRejectionModal({
  scheduling,
  isSubmitting,
  onClose,
  onConfirm,
}: SchedulingRejectionModalProps) {
  const [justification, setJustification] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!justification.trim()) {
      setError("A justificativa é obrigatória.");
      return;
    }

    setError("");
    await onConfirm(justification);
  };

  return (
    <FormModal
      isOpen
      title="Recusar atendimento"
      onClose={isSubmitting ? () => undefined : onClose}
      footerActions={
        <>
          <CommonButton
            label="Cancelar"
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="border border-[#e2ddd5] bg-[#faf7f0] text-[#6a6560] hover:bg-[#f3f0e5]"
          />
          <CommonButton
            label="Confirmar recusa"
            type="button"
            isLoading={isSubmitting}
            loadingLabel="Recusando..."
            onClick={handleConfirm}
            className="bg-[#f4a598] hover:bg-[#f0a195]"
          />
        </>
      }
    >
      <p className="text-sm leading-relaxed text-stone-600">
        Informe ao aluno por que a solicitação de{" "}
        <strong>{scheduling.studentName}</strong> não poderá ser atendida neste
        horário.
      </p>

      <label className="flex flex-col gap-2 text-sm font-semibold text-[#4a4540]">
        Justificativa
        <textarea
          value={justification}
          disabled={isSubmitting}
          rows={5}
          maxLength={500}
          placeholder="Ex.: Horário reservado para reunião pedagógica urgente."
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
          {justification.length}/500
        </span>
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
        O horário será liberado e o aluno receberá a justificativa por e-mail,
        junto com o link para solicitar um novo atendimento.
      </p>
    </FormModal>
  );
}
