"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Clock, AlertCircle, CheckCircle, Trash2 } from "lucide-react";

import CommonButton from "@/components/ui/CommonButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { scheduleService } from "@/features/scheduling/services/schedulingService";

export default function CancelAppointmentCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [appointment, setAppointment] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load appointment details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      if (!token) {
        setErrorMsg("Token de cancelamento não fornecido.");
        setIsLoadingDetails(false);
        return;
      }

      try {
        setIsLoadingDetails(true);
        const data = await scheduleService.getAppointmentByToken(token);
        setAppointment(data);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(
          "Não foi possível carregar os detalhes do agendamento. O link pode ter expirado ou ser inválido.",
        );
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [token]);

  const handleCancelSubmit = async () => {
    if (!token) return;

    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    try {
      await scheduleService.cancelStudent(token, appointment?.type);
      setSuccess(true);
      toast.success("Atendimento cancelado com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocorreu um erro ao cancelar o atendimento.");
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
        <h2 className="text-xl font-bold text-stone-800 mb-2">
          Erro ao Cancelar
        </h2>
        <p className="text-sm text-stone-600 mb-6">{errorMsg}</p>
        <CommonButton
          label="Voltar para o Início"
          onClick={() => (window.location.href = "/")}
          className="bg-stone-600 hover:bg-stone-700 text-white"
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-md mx-auto my-8 bg-white border border-[#ece7db] rounded-2xl shadow-sm">
        <CheckCircle className="text-teal-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-stone-800 mb-2">
          Cancelamento Confirmado
        </h2>
        <p className="text-sm text-stone-600 mb-2">
          Seu atendimento com <strong>{appointment?.pedagogueName}</strong> foi
          cancelado.
        </p>
        <p className="text-xs text-stone-500 mb-6">
          O horário foi liberado com sucesso no sistema. Você receberá um e-mail
          confirmando o cancelamento.
        </p>
        <CommonButton
          label="Ir para o Início"
          onClick={() => (window.location.href = "/")}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-w-[320px] font-sans bg-[#f5f0e8] p-4 sm:p-7">
      <div className="flex flex-col flex-1 h-full max-h-full min-w-0 overflow-hidden rounded-2xl bg-white border border-[#ece7db] shadow-[0_2px_12px_rgba(0,0,0,0.04)] max-w-2xl mx-auto w-full my-8">
        <div className="shrink-0 px-4 pt-5 pb-3 sm:px-7 sm:pt-7 sm:pb-4 border-b border-stone-100 text-center">
          <Trash2 className="text-red-500 mx-auto mb-2" size={36} />
          <h1 className="m-0 text-xl sm:text-2xl font-bold text-stone-800">
            Cancelar Atendimento
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Confirme os detalhes abaixo para realizar o cancelamento do seu
            atendimento.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-6 flex flex-col gap-6 custom-scroll">
          <div className="rounded-xl border border-red-100 bg-[#fffdfd] p-4">
            <h2 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center">
              <Clock size={14} /> Detalhes do Atendimento a ser Cancelado
            </h2>
            <div className="flex flex-col gap-3 text-sm text-stone-700 border-t border-red-50/50 pt-3">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Aluno(a):</span>
                <span className="font-semibold text-stone-800">
                  {appointment?.studentName}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Matrícula:</span>
                <span className="font-semibold text-stone-800">
                  {appointment?.studentEnrollment}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Pedagogo(a):</span>
                <span className="font-semibold text-stone-800">
                  {appointment?.pedagogueName}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-stone-500">Data e Horário:</span>
                <span className="font-semibold text-stone-800">
                  {formatDateTime(appointment?.startDate)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#a88273] bg-[#fff5f2] border border-[#fcbca5]/30 rounded-lg p-3 text-center">
            Atenção: Ao confirmar o cancelamento, este horário será
            imediatamente liberado para outros alunos e a ação não poderá ser
            desfeita.
          </p>
        </div>

        <div className="shrink-0 p-4 sm:px-7 flex flex-col-reverse sm:flex-row justify-center gap-3 border-t border-stone-200 bg-stone-50/50">
          <CommonButton
            label="Voltar"
            type="button"
            onClick={() => (window.location.href = "/")}
            className="w-full sm:w-auto justify-center bg-stone-300 hover:bg-stone-400 text-stone-700"
          />
          <CommonButton
            label={isSubmitting ? "Cancelando..." : "Confirmar Cancelamento"}
            onClick={() => setShowConfirmSubmit(true)}
            disabled={isSubmitting}
            className="w-full sm:w-auto justify-center bg-red-500 hover:bg-red-600 text-white"
          />
        </div>
      </div>

      <ConfirmModal
        open={showConfirmSubmit}
        title="Confirmar Cancelamento"
        message="Tem certeza absoluta que deseja cancelar este atendimento? O horário será liberado no sistema."
        confirmLabel="Cancelar Atendimento"
        confirmColor="critical"
        onConfirm={handleCancelSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
      />
    </div>
  );
}
