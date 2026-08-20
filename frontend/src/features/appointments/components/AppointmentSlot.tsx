import { formatSchedulingTime } from "@/features/scheduling/utils/schedulingDates";
import { cn } from "@/utils/cn";
import { Check, Clock, X } from "lucide-react";
import { TimeSlot } from "../types/appointment";

interface AppointmentSlotProps {
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function AppointmentSlot({
  slot,
  isSelected,
  onSelect,
}: AppointmentSlotProps) {
  if (slot.status !== "CREATED") {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-[#fcbca5]/50 bg-[#fff5f2] px-4 py-3 sm:px-5 sm:py-3.5 opacity-70">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fcbca5]/30 text-[#e87a55]">
          <X size={16} />
        </div>

        <div className="flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 sm:gap-0">
          <span className="text-sm font-semibold text-[#a88273] line-through">
            {formatSchedulingTime(slot.startDateTime)} - {formatSchedulingTime(slot.endDateTime)}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e87a55]">
            Indisponível
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(slot.id)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-4 py-3 sm:px-5 sm:py-3.5 transition-all duration-200 focus:outline-none cursor-pointer",
        isSelected
          ? "border-[#6bc4a6] bg-[#e6f4ef]"
          : "border-[#e8e0d5] bg-white hover:bg-[#f9f9f9]",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors bg-[#e6f4ef] text-[#6bc4a6]",
          isSelected ? "bg-[#6bc4a6] text-white" : "",
        )}
      >
        {isSelected ? <Check size={16} /> : <Clock size={16} />}
      </div>

      <div className="flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 sm:gap-0">
        <span
          className={cn(
            "text-sm font-bold transition-colors",
            isSelected ? "text-[#5eaa91]" : "text-[#5a5248]",
          )}
        >
          {formatSchedulingTime(slot.startDateTime)} - {formatSchedulingTime(slot.endDateTime)}
        </span>
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs font-bold transition-colors",
            isSelected ? "text-[#5eaa91]" : "text-[#a0998e]",
          )}
        >
          {isSelected ? "Selecionado" : "Disponível"}
        </div>
      </div>
    </button>
  );
}
