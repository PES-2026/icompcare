import { ScheduleStatusEnum } from "../../types/schedulingManagement";

const statusConfig: Record<string, { label: string; className: string }> = {
  [ScheduleStatusEnum.PENDING]: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-700",
  },
  [ScheduleStatusEnum.CONFIRMED]: {
    label: "Confirmado",
    className: "bg-emerald-100 text-emerald-700",
  },
  [ScheduleStatusEnum.DONE]: {
    label: "Finalizado",
    className: "bg-stone-100 text-stone-700",
  },
  [ScheduleStatusEnum.COMPLETED]: {
    label: "Concluído",
    className: "bg-stone-100 text-stone-700",
  },
  [ScheduleStatusEnum.CANCELED]: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700",
  },
  [ScheduleStatusEnum.CANCELED_BY_STUDENT]: {
    label: "Cancelado (Aluno)",
    className: "bg-red-100 text-red-700",
  },
  [ScheduleStatusEnum.CANCELED_BY_PEDAGOGUE]: {
    label: "Cancelado (Pedagogo)",
    className: "bg-red-100 text-red-700",
  },
  [ScheduleStatusEnum.EXPIRED]: {
    label: "Expirado",
    className: "bg-stone-100 text-stone-500",
  },
  [ScheduleStatusEnum.ABSENT]: {
    label: "Ausente",
    className: "bg-stone-100 text-stone-500",
  },
  [ScheduleStatusEnum.MISSED]: {
    label: "Ausente",
    className: "bg-stone-100 text-stone-500",
  },
};

const defaultStatusConfig = {
  label: "Desconhecido",
  className: "bg-stone-100 text-stone-600",
};

export default function SchedulingStatusBadge({
  status,
}: {
  status: ScheduleStatusEnum | string;
}) {
  const config = (status && statusConfig[status]) || defaultStatusConfig;

  return (
    <span
      className={`inline-flex justify-center rounded-lg px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
