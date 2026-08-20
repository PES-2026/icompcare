"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Calendar, User, Mail, GraduationCap, Clock, AlertCircle, CheckCircle } from "lucide-react";

import CommonButton from "@/components/ui/CommonButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { Field } from "@/components/ui/Field";
import { scheduleService } from "@/features/scheduling/services/schedulingService";
import { TimeSlot } from "../types/appointment";
import { AppointmentSlot } from "./AppointmentSlot";
import { cn } from "@/utils/cn";

export default function RescheduleAppointmentCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [appointment, setAppointment] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [newDate, setNewDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [success, setSuccess] = useState(false);

  const todayStr = new Date().toLocaleDateString("sv-SE");

  // Load appointment details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      if (!token) {
        setErrorMsg("Token de reagendamento não fornecido.");
        setIsLoadingDetails(false);
        return;
      }

      try {
        setIsLoadingDetails(true);
        const data = await scheduleService.getAppointmentByToken(token);
        setAppointment(data);
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Não foi possível carregar os detalhes do agendamento. O link pode ter expirado ou ser inválido.");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [token]);

  // Load slots when pedagogue and date are available
  useEffect(() => {
    const fetchSlots = async () => {
      if (!newDate || !appointment?.pedagogueId) {
        setSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const data = await scheduleService.getAvailability(appointment.pedagogueId, newDate);
        setSlots(data.items);
      } catch (error) {
        setSlots([]);
        toast.error("Erro ao carregar horários disponíveis para este dia.");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [newDate, appointment?.pedagogueId]);

  const handleSelectSlot = (id: string) => {
    setSelectedSlotId(selectedSlotId === id ? "" : id);
  };

  const validateForm = () => {
    if (!selectedSlotId) {
      toast.error("Você precisa selecionar um novo horário disponível.");
      return false;
    }

    if (reason && reason.trim().length < 15) {
      setReasonError("O motivo deve ter pelo menos 15 caracteres");
      return false;
    }

    setReasonError("");
    return true;
  };

  const handleOpenConfirm = () => {
    if (validateForm()) {
      setShowConfirmSubmit(true);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!token || !appointment) return;
    
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    try {
      await scheduleService.rescheduleStudent(token, {
        newSlotId: selectedSlotId,
        type: appointment.type,
        reason: reason.trim() || undefined,
      });
      setSuccess(true);
      toast.success("Atendimento reagendado com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocorreu um erro ao reagendar o atendimento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const baseInputClass =
    "w-full px-3.5 py-2.5 border-[1.5px] rounded-md text-sm outline-none bg-stone-100 border-stone-300 text-stone-500 font-sans cursor-not-allowed";

  if (isLoadingDetails) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-[#a0998e]">
        <Loader2 className="animate-spin mr-2" size={32} />
        <span>Carregando detalhes do agendamento...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-md mx-auto my-8 bg-white border border-[#ece7db] rounded-2xl shadow-sm">
        <AlertCircle className="text-red-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-stone-800 mb-2">Erro ao Reagendar</h2>
        <p className="text-sm text-stone-600 mb-6">{errorMsg}</p>
        <CommonButton
          label="Voltar para o Início"
          onClick={() => window.location.href = "/"}
          className="bg-stone-600 hover:bg-stone-700 text-white"
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-md mx-auto my-8 bg-white border border-[#ece7db] rounded-2xl shadow-sm">
        <CheckCircle className="text-teal-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-stone-800 mb-2">Reagendamento Solicitado!</h2>
        <p className="text-sm text-stone-600 mb-2">
          Sua solicitação de reagendamento para o atendimento com <strong>{appointment?.pedagogueName}</strong> foi enviada.
        </p>
        <p className="text-xs text-stone-500 mb-6">
          O status do seu atendimento foi alterado para <strong>PENDENTE DE CONFIRMAÇÃO</strong>. Você receberá um e-mail com os novos dados em breve.
        </p>
        <CommonButton
          label="Ir para o Início"
          onClick={() => window.location.href = "/"}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-w-[320px] font-sans bg-[#f5f0e8] p-4 sm:p-7">
      <div className="flex flex-col flex-1 h-full max-h-full min-w-0 overflow-hidden rounded-2xl bg-white border border-[#ece7db] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="shrink-0 px-4 pt-5 pb-3 sm:px-7 sm:pt-7 sm:pb-4 border-b border-stone-100">
          <h1 className="m-0 text-xl sm:text-2xl text-center sm:text-left font-bold text-stone-800">
            Reagendar Atendimento
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Escolha uma nova data e horário para o seu atendimento. O horário anterior será liberado automaticamente.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-4 flex flex-col gap-5 custom-scroll">
          
          {/* Informações do Agendamento Atual */}
          <div className="rounded-xl border border-[#ece7db] bg-[#faf8f5] p-4">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={14} /> Detalhes do Agendamento Atual
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-stone-500 block text-xs">Pedagogo(a):</span>
                <span className="font-semibold text-stone-800">{appointment?.pedagogueName}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-xs">Data e Horário:</span>
                <span className="font-semibold text-stone-800">
                  {formatDateTime(appointment?.startDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 grid grid-cols-1 sm:grid-cols-10 gap-3.5 sm:gap-5">
            <div className="sm:col-span-4">
              <Field label="Aluno(a):">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={appointment?.studentName || ""}
                    className={cn(baseInputClass, "pl-9")}
                  />
                </div>
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Matrícula:">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                    <GraduationCap size={16} />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={appointment?.studentEnrollment || ""}
                    className={cn(baseInputClass, "pl-9")}
                  />
                </div>
              </Field>
            </div>

            <div className="sm:col-span-4">
              <Field label="Email:">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={appointment?.studentEmail || ""}
                    className={cn(baseInputClass, "pl-9")}
                  />
                </div>
              </Field>
            </div>
          </div>

          <div className="shrink-0 grid grid-cols-1 sm:grid-cols-10 gap-3.5 sm:gap-5">
            <div className="sm:col-span-6">
              <Field label="Curso:">
                <input
                  type="text"
                  disabled
                  value={appointment?.studentCourse || ""}
                  className={baseInputClass}
                />
              </Field>
            </div>

            <div className="sm:col-span-4">
              <CustomDatePicker
                value={newDate as any}
                onChange={(val) => setNewDate(new Date(val + "T00:00:00"))}
                label="Nova Data:"
                minDate={todayStr}
                required
              />
            </div>
          </div>

          <div className="shrink-0">
            <Field
              label="Motivo da alteração (opcional):"
              error={reasonError}
            >
              <textarea
                placeholder="Descreva brevemente o motivo da remarcação (mínimo 15 caracteres)"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value && e.target.value.length < 15) {
                    setReasonError("O motivo deve ter pelo menos 15 caracteres");
                  } else {
                    setReasonError("");
                  }
                }}
                className={cn(
                  "w-full px-3.5 py-2.5 border-[1.5px] rounded-md text-sm outline-none transition-colors font-sans text-stone-800 min-h-24 resize-none bg-white",
                  reasonError
                    ? "border-red-400 text-red-900 focus:border-red-400"
                    : "border-stone-300 hover:border-stone-400 focus:border-teal-400"
                )}
              />
            </Field>
          </div>

          {/* Grid de Seleção de Horários */}
          <div
            className="flex flex-col shrink-0 min-h-[220px] rounded-2xl border border-[#f0e9df] bg-[#faf8f5] p-3 sm:p-4"
          >
            <div className="shrink-0 mb-3 sm:mb-4 flex flex-col items-center justify-center gap-3 sm:gap-6 sm:flex-row">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a5248]">
                  <div className="h-3 w-3 rounded-full bg-[#6bc4a6]" />{" "}
                  Disponível
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a5248]">
                  <div className="h-3 w-3 rounded-full bg-[#fcbca5]" />{" "}
                  Indisponível
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1 pr-2 sm:pr-3 custom-scroll flex flex-col gap-2">
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-6 h-full text-[#a0998e]">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : slots.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="py-4 text-center text-sm text-[#a0998e]">
                    {newDate 
                      ? "Não há horários disponíveis para o pedagogo nesta data." 
                      : "Selecione uma data para visualizar os horários disponíveis."
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <AppointmentSlot
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlotId === slot.id}
                      onSelect={handleSelectSlot}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-4 sm:px-7 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-stone-200 bg-stone-50/50">
          <CommonButton
            label="Voltar"
            type="button"
            onClick={() => window.location.href = "/"}
            className="w-full sm:w-auto justify-center bg-stone-300 hover:bg-stone-400 text-stone-700"
          />
          <CommonButton
            label={isSubmitting ? "Enviando..." : "Confirmar Reagendamento"}
            onClick={handleOpenConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto justify-center bg-[#6bc4a6] hover:bg-[#5eaa91]"
          />
        </div>
      </div>

      <ConfirmModal
        open={showConfirmSubmit}
        title="Solicitar Reagendamento"
        message="Tem certeza que deseja solicitar a alteração do horário do seu atendimento? O horário anterior será desmarcado."
        confirmLabel="Reagendar"
        confirmColor="primary"
        onConfirm={handleRescheduleSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
      />
    </div>
  );
}
