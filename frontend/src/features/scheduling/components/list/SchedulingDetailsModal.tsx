"use client";

import CommonButton from "@/components/ui/CommonButton";
import { X } from "lucide-react";
import { ScheduleItem } from "../../types/schedulingManagement";
import {
  formatSchedulingDate,
  formatSchedulingDateTime,
  formatSchedulingTime,
} from "../../utils/schedulingDates";
import SchedulingStatusBadge from "./SchedulingStatusBadge";

interface SchedulingDetailsModalProps {
  scheduling: ScheduleItem | null;
  onClose: () => void;
}

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">
      {label}
    </dt>
    <dd className="mt-1 text-sm font-medium text-[#4a4540]">{value}</dd>
  </div>
);

export default function SchedulingDetailsModal({
  scheduling,
  onClose,
}: SchedulingDetailsModalProps) {
  if (!scheduling) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheduling-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="scheduling-details-title"
              className="text-xl font-bold text-[#3a3530]"
            >
              Detalhes do agendamento
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Informações enviadas pelo estudante.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={20} />
          </button>
        </header>

        <div className="mb-6 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div>
            <p className="font-semibold text-[#3a3530]">
              {formatSchedulingDate(scheduling.startDate)}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {formatSchedulingTime(scheduling.startDate)} às{" "}
              {formatSchedulingTime(scheduling.endDate)}
            </p>
          </div>
          <SchedulingStatusBadge status={scheduling.status} />
        </div>

        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Detail label="Aluno" value={scheduling.studentName} />
          <Detail label="Matrícula" value={scheduling.studentEnrollment} />
          <Detail label="E-mail" value={scheduling.studentEmail} />
          <Detail
            label="Curso"
            value={scheduling.studentCourse}
          />
          <Detail
            label="Solicitado em"
            value={formatSchedulingDateTime(scheduling.createdAt)}
          />
          <div className="sm:col-span-2">
            <Detail label="Motivo do atendimento" value={scheduling.reason} />
          </div>
        </dl>

        <footer className="mt-8 flex justify-end">
          <CommonButton
            label="Fechar"
            type="button"
            onClick={onClose}
            className="min-w-24 justify-center"
          />
        </footer>
      </section>
    </div>
  );
}
