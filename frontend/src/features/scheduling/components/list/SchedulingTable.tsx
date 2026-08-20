"use client";

import CommonButton from "@/components/ui/CommonButton";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Check, Eye, Loader2, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useManagedSchedulings } from "../../hooks/useManagedScheduling";
import {
  ListScheduleFilters,
  ScheduleItem,
} from "../../types/schedulingManagement";
import {
  formatSchedulingDate,
  formatSchedulingTime,
} from "../../utils/schedulingDates";
import SchedulingRejectionModal from "../pending/SchedulingRejectionModal";
import CreateStudentFromAppointmentModal from "./CreateStudentFromAppointmentModal";
import SchedulingDetailsModal from "./SchedulingDetailsModal";
import SchedulingEmptyState from "./SchedulingEmptyState";
import SchedulingFilters from "./SchedulingFilters";
import SchedulingStatusBadge from "./SchedulingStatusBadge";

export default function SchedulingTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedScheduling, setSelectedScheduling] =
    useState<ScheduleItem | null>(null);
  const [cancelSchedulingTarget, setCancelSchedulingTarget] =
    useState<ScheduleItem | null>(null);
  const [createStudentTarget, setCreateStudentTarget] =
    useState<ScheduleItem | null>(null);

  const {
    schedulings,
    totalItems,
    isLoading,
    processingId,
    error,
    setFilters,
    cancelScheduling,
    reload,
  } = useManagedSchedulings(page, limit);

  const handleApplyFilters = useCallback(
    (filters: ListScheduleFilters) => {
      setPage(1);
      setFilters(filters);
    },
    [setFilters],
  );

  const handleCancelConfirm = async (justification: string) => {
    if (!cancelSchedulingTarget) return;

    try {
      await cancelScheduling(
        cancelSchedulingTarget.id,
        justification,
        cancelSchedulingTarget.type,
      );
      setCancelSchedulingTarget(null);
      toast.success("Agendamento cancelado com sucesso.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível cancelar o agendamento.",
      );
    }
  };

  const handleStartAttendance = (scheduling: ScheduleItem) => {
    if (
      scheduling.studentId &&
      scheduling.studentId !== "Guest student" &&
      scheduling.type === "STUDENT"
    ) {
      const demand = encodeURIComponent(scheduling.reason || "");
      const date = encodeURIComponent(scheduling.startDate || "");
      router.push(
        `/pedagogue/students/${scheduling.studentId}/attendance/register?demand=${demand}&date=${date}`,
      );
    } else {
      setCreateStudentTarget(scheduling);
    }
  };

  const handleStudentCreated = (newStudentId: string) => {
    const demand = encodeURIComponent(createStudentTarget?.reason || "");
    const date = encodeURIComponent(createStudentTarget?.startDate || "");
    setCreateStudentTarget(null);
    router.push(
      `/pedagogue/students/${newStudentId}/attendance/register?demand=${demand}&date=${date}`,
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const columns: Column<ScheduleItem>[] = [
    {
      label: "Aluno",
      width: "min-w-[220px]",
      renderCell: (scheduling) => (
        <span className="font-medium text-[#3a3530]">
          {scheduling.studentName}
        </span>
      ),
    },
    {
      label: "Matrícula",
      width: "min-w-[130px]",
      renderCell: (scheduling) => scheduling.studentEnrollment,
    },
    {
      label: "E-mail",
      width: "min-w-[250px]",
      renderCell: (scheduling) => scheduling.studentEmail,
    },
    {
      label: "Curso",
      width: "min-w-[220px]",
      renderCell: (scheduling) => scheduling.studentCourse,
    },
    {
      label: "Data",
      width: "min-w-[120px]",
      renderCell: (scheduling) => formatSchedulingDate(scheduling.startDate),
    },
    {
      label: "Horário",
      width: "min-w-[150px]",
      renderCell: (scheduling) => (
        <span className="text-sm">
          {formatSchedulingTime(scheduling.startDate)} -{" "}
          {formatSchedulingTime(scheduling.endDate)}
        </span>
      ),
    },
    {
      label: "Status",
      width: "min-w-[130px]",
      renderCell: (scheduling) => (
        <SchedulingStatusBadge status={scheduling.status} />
      ),
    },
    {
      label: "Ações",
      width: "min-w-[140px]",
      renderCell: (scheduling) => {
        const isProcessing = processingId === scheduling.id;
        const canAction = scheduling.status === "CONFIRMED";

        return (
          <div className="flex items-center justify-center gap-1">
            <CommonButton
              label=""
              type="button"
              aria-label={`Visualizar agendamento de ${scheduling.studentName}`}
              title="Visualizar detalhes"
              startIcon={Eye}
              sizeIcon={19}
              disabled={isProcessing}
              onClick={() => setSelectedScheduling(scheduling)}
              className="gap-0 rounded-md p-1 text-[#b0a898] bg-transparent hover:bg-[#f0ebe2]"
            />

            {canAction && (
              <>
                <CommonButton
                  label=""
                  type="button"
                  aria-label={`Registrar atendimento para ${scheduling.studentName}`}
                  title="Registrar Atendimento"
                  startIcon={Check}
                  sizeIcon={20}
                  disabled={isProcessing}
                  onClick={() => handleStartAttendance(scheduling)}
                  className="gap-0 rounded-md p-1 text-[#6bc4a6] bg-transparent hover:bg-[#e8f7f2]"
                />
                <CommonButton
                  label=""
                  type="button"
                  aria-label={`Cancelar agendamento de ${scheduling.studentName}`}
                  title="Cancelar Agendamento"
                  startIcon={X}
                  sizeIcon={20}
                  disabled={isProcessing}
                  onClick={() => setCancelSchedulingTarget(scheduling)}
                  className="gap-0 rounded-md p-1 text-red-600 bg-transparent hover:bg-red-100"
                />
              </>
            )}
          </div>
        );
      },
    },
  ];

  const loadingComponent = (
    <div className="flex h-full min-h-96 items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-stone-500">
        <Loader2 className="animate-spin text-[#6bc4a6]" size={30} />
        <p className="text-sm">Carregando agendamentos...</p>
      </div>
    </div>
  );

  return (
    <>
      <DataTable
        title="Lista de Agendamentos"
        headerAction={
          error ? (
            <CommonButton
              label="Tentar novamente"
              startIcon={RefreshCw}
              onClick={reload}
            />
          ) : undefined
        }
        toolbar={<SchedulingFilters onApply={handleApplyFilters} />}
        isLoading={isLoading}
        loadingComponent={loadingComponent}
        data={schedulings}
        columns={columns}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        totalItems={totalItems}
        totalPages={totalPages}
        emptyMessage={error || undefined}
        emptyComponent={error ? undefined : <SchedulingEmptyState />}
      />

      <SchedulingDetailsModal
        scheduling={selectedScheduling}
        onClose={() => setSelectedScheduling(null)}
      />

      {cancelSchedulingTarget && (
        <SchedulingRejectionModal
          scheduling={cancelSchedulingTarget}
          isSubmitting={processingId === cancelSchedulingTarget.id}
          onClose={() => setCancelSchedulingTarget(null)}
          onConfirm={handleCancelConfirm}
        />
      )}

      {createStudentTarget && (
        <CreateStudentFromAppointmentModal
          scheduling={createStudentTarget}
          onClose={() => setCreateStudentTarget(null)}
          onSuccess={handleStudentCreated}
        />
      )}
    </>
  );
}
