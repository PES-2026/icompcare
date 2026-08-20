"use client";

import { CalendarDays, Check, Clock3, X } from "lucide-react";

import { SchedulingDayPreview, SchedulingSlot } from "../../types/scheduling";

interface SchedulingPreviewListProps {
  days: SchedulingDayPreview[];
  hasGeneratedPreview: boolean;
  disabledSlotIds: Set<string>;
  onToggleSlot: (slotId: string) => void;
  onToggleAllDaySlots: (daySlots: string[], isEnablingAll: boolean) => void;
}

const formatDateLabel = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

const formatWeekday = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  })
    .format(d)
    .replace(".", "");
};

const padTime = (value: number) => String(value).padStart(2, "0");

const formatTimeFromMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${padTime(hours)}:${padTime(minutes)}`;
};

const getSlotId = (slot: SchedulingSlot, dayDate: Date | string) => {
  if (slot.startDateTime && slot.endDateTime) {
    return `${slot.startDateTime}|${slot.endDateTime}`;
  }
  const dateStr = typeof dayDate === "string" ? dayDate : dayDate.toISOString();
  return `${dateStr}|${slot.start}|${slot.end}`;
};

export default function SchedulingPreviewList({
  days,
  hasGeneratedPreview,
  disabledSlotIds,
  onToggleSlot,
  onToggleAllDaySlots,
}: SchedulingPreviewListProps) {
  if (!hasGeneratedPreview) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 px-6 py-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600 shadow-sm">
          <CalendarDays size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-stone-800">
          Nenhuma prévia gerada
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-500">
          Preencha o formulário acima e clique em &quot;Gerar disponibilidade&quot; para
          visualizar e gerenciar os horários antes de salvar.
        </p>
      </div>
    );
  }

  const formatSlotTime = (timeVal: Date | string | number) => {
    if (typeof timeVal === "number") {
      return formatTimeFromMinutes(timeVal);
    }

    const date = typeof timeVal === "string" ? new Date(timeVal) : timeVal;
    if (date instanceof Date && !isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }

    return "";
  };

  const allSlots = days.flatMap((day) => day.slots);

  if (allSlots.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm">
          <Clock3 size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-amber-900">
          Nenhum horário disponível
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-amber-700">
          A duração informada é maior que o intervalo entre o horário inicial e
          final, ou não há tempo suficiente para agendar um atendimento.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-nowrap md:flex-wrap gap-4 overflow-x-auto md:overflow-visible pb-4 custom-scroll snap-x snap-mandatory">
        {days.map((day) => {
          const daySlotIds = day.slots.map((slot) => getSlotId(slot, day.date));

          // A slot is "selected/enabled" if:
          // 1. It is AVAILABLE and in disabledSlotIds (means we actively selected it to be created)
          // 2. It is CREATED and NOT in disabledSlotIds (means it exists and we haven't actively removed it)
          const enabledSlotsCount = day.slots.reduce((acc, slot) => {
            const slotId = getSlotId(slot, day.date);
            const isToggled = disabledSlotIds.has(slotId);
            const isAvailable = slot.status === "AVAILABLE";
            const isCreated = slot.status === "CREATED";

            if ((isAvailable && isToggled) || (isCreated && !isToggled)) {
              return acc + 1;
            }
            return acc;
          }, 0);

          const totalSlots = day.slots.length;
          const isAllEnabled =
            totalSlots > 0 && enabledSlotsCount === totalSlots;

          return (
            <article
              key={day.date instanceof Date ? day.date.toISOString() : day.date}
              className="shrink-0 w-[85vw] sm:w-64 md:w-auto md:flex-1 md:min-w-60 snap-center overflow-hidden rounded-2xl border border-stone-200 bg-white"
            >
              <header className="flex flex-col items-center justify-center border-b border-stone-100 bg-stone-50 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                  {formatWeekday(day.date)}
                </span>
                <h3 className="text-base font-semibold text-stone-700">
                  {formatDateLabel(day.date)}
                </h3>

                <div className="mt-3 w-full border-t border-stone-200/60 pt-3">
                  <label className="flex cursor-pointer items-center justify-between group">
                    <span className="text-xs font-medium text-stone-600 group-hover:text-stone-800 transition-colors">
                      {isAllEnabled ? "Desmarcar todos" : "Selecionar todos"}
                    </span>
                    <div
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isAllEnabled ? "bg-teal-500" : "bg-stone-200"
                      }`}
                      onClick={() =>
                        onToggleAllDaySlots(daySlotIds, !isAllEnabled)
                      }
                      role="switch"
                      aria-checked={isAllEnabled}
                    >
                      <span
                        className={`pointer-events-none flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isAllEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      >
                        {isAllEnabled && (
                          <Check
                            size={10}
                            className="text-teal-500"
                            strokeWidth={3}
                          />
                        )}
                      </span>
                    </div>
                  </label>
                </div>
              </header>

              <div className="flex flex-col p-2 gap-1.5 max-h-75 md:max-h-none overflow-y-auto custom-scroll">
                {day.slots.map((slot) => {
                  const slotId = getSlotId(slot, day.date);
                  const isToggled = disabledSlotIds.has(slotId);
                  const isAvailable = slot.status === "AVAILABLE";
                  const isCreated = slot.status === "CREATED";

                  let buttonClass = "";
                  let timeClass = "";
                  let subTimeClass = "";
                  let toggleBgClass = "";
                  let toggleDotClass = "";
                  let icon = null;

                  if (isAvailable) {
                    if (isToggled) {
                      buttonClass =
                        "border-teal-100 bg-teal-50 hover:border-teal-200 hover:bg-teal-100/70";
                      timeClass = "text-teal-800";
                      subTimeClass = "text-teal-600";
                      toggleBgClass = "bg-teal-500";
                      toggleDotClass = "translate-x-5";
                      icon = (
                        <Check
                          size={12}
                          className="text-teal-500"
                          strokeWidth={3}
                        />
                      );
                    } else {
                      buttonClass =
                        "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50";
                      timeClass = "text-stone-600";
                      subTimeClass = "text-stone-400";
                      toggleBgClass = "bg-stone-200";
                      toggleDotClass = "translate-x-0";
                      icon = (
                        <Clock3
                          size={12}
                          className="text-stone-400"
                          strokeWidth={3}
                        />
                      );
                    }
                  } else if (isCreated) {
                    if (isToggled) {
                      buttonClass =
                        "border-red-100 bg-red-50 hover:border-red-200 hover:bg-red-100/70";
                      timeClass = "text-red-700 line-through opacity-70";
                      subTimeClass = "text-red-500 opacity-70";
                      toggleBgClass = "bg-red-300";
                      toggleDotClass = "translate-x-0";
                      icon = (
                        <X size={12} className="text-red-500" strokeWidth={3} />
                      );
                    } else {
                      buttonClass =
                        "border-teal-100 bg-teal-50 hover:border-teal-200 hover:bg-teal-100/70";
                      timeClass = "text-teal-800";
                      subTimeClass = "text-teal-600";
                      toggleBgClass = "bg-teal-500";
                      toggleDotClass = "translate-x-5";
                      icon = (
                        <Check
                          size={12}
                          className="text-teal-500"
                          strokeWidth={3}
                        />
                      );
                    }
                  }

                  return (
                    <button
                      key={slotId}
                      type="button"
                      onClick={() => onToggleSlot(slotId)}
                      aria-pressed={
                        (isAvailable && isToggled) || (isCreated && !isToggled)
                      }
                      aria-label={`Horário de ${formatSlotTime(slot.start)} às ${formatSlotTime(slot.end)}`}
                      className={`group relative flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98] ${buttonClass}`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${timeClass}`}>
                          {formatSlotTime(slot.start)}
                        </span>
                        <span
                          className={`text-[11px] font-medium ${subTimeClass}`}
                        >
                          até {formatSlotTime(slot.end)}
                        </span>
                      </div>

                      <div
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggleBgClass}`}
                      >
                        <span
                          className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${toggleDotClass}`}
                        >
                          {icon}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
