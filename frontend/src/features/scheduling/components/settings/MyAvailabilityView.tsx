"use client";

import CommonButton from "@/components/ui/CommonButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { useAuthStore } from "@/store/authStore";
import {
  AlertCircle,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { scheduleService } from "../../services/schedulingService";
import {
  formatSchedulingDate,
  formatSchedulingTime,
} from "../../utils/schedulingDates";

interface MyAvailabilityViewProps {
  onGoToCreate?: () => void;
}

interface SlotItem {
  id: string;
  startDateTime: string;
  endDateTime: string;
  attendanceTime: number;
  status: string;
  appointmentId?: string;
}

export default function MyAvailabilityView({
  onGoToCreate,
}: MyAvailabilityViewProps) {
  const userId = useAuthStore((state) => state.user?.id);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString("sv-SE"),
  );
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [slotToRemove, setSlotToRemove] = useState<SlotItem | null>(null);

  const loadSlots = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      let startDate: string | undefined;
      let endDate: string | undefined;

      if (selectedDate) {
        startDate = `${selectedDate}T00:00:00.000`;
        endDate = `${selectedDate}T23:59:59.999`;
      }

      const response = await scheduleService.getAllAvailabilities(userId, {
        startDate,
        endDate,
        status: filterStatus === "ALL" ? undefined : filterStatus,
        page: 1,
        limit: 100,
      });

      setSlots((response.items as any) || []);
    } catch (err) {
      setSlots([]);
      toast.error("Não foi possível carregar os horários da agenda.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedDate, filterStatus]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleConfirmRemove = async () => {
    if (!slotToRemove) return;

    try {
      setDeletingSlotId(slotToRemove.id);
      await scheduleService.removeSlots([slotToRemove.id]);
      toast.success("Horário removido com sucesso!");
      setSlotToRemove(null);
      await loadSlots();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao remover horário.",
      );
    } finally {
      setDeletingSlotId(null);
    }
  };

  const availableCount = slots.filter(
    (s) => s.status === "CREATED" && !s.appointmentId,
  ).length;
  const bookedCount = slots.filter(
    (s) => s.status === "CONFIRMED" || s.appointmentId,
  ).length;
  const pendingCount = slots.filter((s) => s.status === "PENDING").length;

  const groupedSlots = slots.reduce<Record<string, SlotItem[]>>((acc, slot) => {
    const dateKey = formatSchedulingDate(slot.startDateTime);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  return (
    <main className="flex h-full w-full flex-col p-4 md:p-6 font-sans">
      <div className="flex flex-col flex-1 min-h-0 w-full rounded-2xl border border-[#ece7db] bg-[#faf7f0] p-4 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-[#ece7db] pb-4">
          <div>
            <h1 className="m-0 text-xl font-bold text-[#3a3530]">
              Minha Agenda de Atendimentos
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Visualize seus horários cadastrados, quais estão disponíveis e
              quais já foram agendados.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CommonButton
              label="Atualizar"
              startIcon={RefreshCw}
              onClick={loadSlots}
              disabled={isLoading}
              className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-sm"
            />
            {onGoToCreate && (
              <CommonButton
                label="Criar nova agenda"
                startIcon={CalendarPlus}
                onClick={onGoToCreate}
                className="bg-teal-600 text-white hover:bg-teal-700 text-sm"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-stone-400">
                Total de Horários
              </p>
              <p className="text-2xl font-bold text-stone-800 mt-0.5">
                {slots.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
              <Clock size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-teal-600">
                Disponíveis
              </p>
              <p className="text-2xl font-bold text-teal-700 mt-0.5">
                {availableCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-600">
                Pendentes
              </p>
              <p className="text-2xl font-bold text-amber-700 mt-0.5">
                {pendingCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertCircle size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-600">
                Agendados
              </p>
              <p className="text-2xl font-bold text-blue-700 mt-0.5">
                {bookedCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3.5 rounded-xl border border-stone-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
              <Calendar size={16} className="text-stone-400" /> Data:
            </span>
            <div className="w-56">
              <CustomDatePicker
                label=""
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                placeholder="Selecione o dia"
              />
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="text-xs text-teal-700 hover:text-teal-900 underline cursor-pointer"
              >
                Ver todos os dias
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-stone-400 flex items-center gap-1">
              <Filter size={14} /> Status:
            </span>
            <div className="flex rounded-lg bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === "ALL"
                    ? "bg-white text-stone-800 shadow-sm"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("CREATED")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === "CREATED"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Disponíveis
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("CONFIRMED")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === "CONFIRMED"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Agendados
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scroll pr-1">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center flex-col gap-3 text-stone-500">
              <Loader2 className="animate-spin text-teal-600" size={32} />
              <p className="text-sm">Carregando horários da agenda...</p>
            </div>
          ) : Object.keys(groupedSlots).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-stone-200 rounded-xl bg-white p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <Clock size={24} />
              </div>
              <h3 className="text-base font-semibold text-stone-700">
                Nenhum horário encontrado
              </h3>
              <p className="text-sm text-stone-500 mt-1 max-w-md">
                Não há horários cadastrados para a data ou filtro selecionado.
                Você pode gerar novas disponibilidades na aba "Criar agenda".
              </p>
              {onGoToCreate && (
                <CommonButton
                  label="Configurar Disponibilidade"
                  startIcon={CalendarPlus}
                  onClick={onGoToCreate}
                  className="mt-4 bg-teal-600 text-white hover:bg-teal-700 text-sm"
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(groupedSlots).map(([dateLabel, dateSlots]) => (
                <div
                  key={dateLabel}
                  className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-teal-600" />
                      <h2 className="text-base font-bold text-stone-800 m-0">
                        {dateLabel}
                      </h2>
                    </div>
                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                      {dateSlots.length}{" "}
                      {dateSlots.length === 1 ? "horário" : "horários"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {dateSlots.map((slot) => {
                      const isAvailable =
                        slot.status === "CREATED" && !slot.appointmentId;
                      const isPending = slot.status === "PENDING";
                      const isConfirmed =
                        slot.status === "CONFIRMED" || !!slot.appointmentId;
                      const isDeleting = deletingSlotId === slot.id;

                      return (
                        <div
                          key={slot.id}
                          className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                            isAvailable
                              ? "bg-teal-50/40 border-teal-200 hover:border-teal-300"
                              : isPending
                                ? "bg-amber-50/40 border-amber-200"
                                : "bg-blue-50/40 border-blue-200"
                          }`}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                              <Clock size={15} className="text-stone-400" />
                              <span>
                                {formatSchedulingTime(slot.startDateTime)} -{" "}
                                {formatSchedulingTime(slot.endDateTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  isAvailable
                                    ? "bg-teal-100 text-teal-800"
                                    : isPending
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {isAvailable
                                  ? "Disponível"
                                  : isPending
                                    ? "Pendente"
                                    : "Agendado"}
                              </span>
                              <span className="text-[11px] text-stone-400">
                                {slot.attendanceTime} min
                              </span>
                            </div>
                          </div>

                          {isAvailable && (
                            <button
                              type="button"
                              title="Remover horário disponível"
                              disabled={isDeleting}
                              onClick={() => setSlotToRemove(slot)}
                              className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              {isDeleting ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!slotToRemove}
        title="Remover Horário de Atendimento"
        message={`Deseja realmente remover o horário ${
          slotToRemove ? formatSchedulingTime(slotToRemove.startDateTime) : ""
        } - ${
          slotToRemove ? formatSchedulingTime(slotToRemove.endDateTime) : ""
        }? Ele não estará mais disponível para agendamento pelos alunos.`}
        onCancel={() => setSlotToRemove(null)}
        onConfirm={handleConfirmRemove}
        confirmLabel="Remover"
        confirmColor="critical"
      />
    </main>
  );
}
