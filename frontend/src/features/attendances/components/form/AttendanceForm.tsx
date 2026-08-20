"use client";

import CommonButton from "@/components/ui/CommonButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Field } from "@/components/ui/Field";
import { SuccessScreenForm } from "@/components/ui/SuccessScreenForm";
import { PATHS } from "@/constants/paths";
import { useAttendanceTypesOptions } from "@/features/attendance-types/hooks/useAttendanceTypesOptions";
import { useStudentById } from "@/features/students/hooks/useStudentById";
import { formatDate, maskDate } from "@/utils/utils";
import { Loader2 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAttendanceForm } from "../../hooks/useAttendanceForm";
import { attendanceService } from "../../services/attendanceService";
import {
  AttendanceFormData,
  AttendanceFormErrors,
} from "../../types/attendance";
import {
  EMPTY_FORM_ATTENDANCE,
  formatAttendanceForBackend,
  validateAttendanceForm,
} from "../../utils/attendanceUtils";

interface FormProps {
  isEditMode?: boolean;
  onCancel?: () => void;
}

export default function AttendanceForm({
  isEditMode = false,
  onCancel,
}: FormProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = decodeURIComponent((params?.studentId as string) ?? "");
  const attendanceId = decodeURIComponent(
    (params?.attendanceId as string) ?? "",
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<AttendanceFormErrors>({});

  const { formData, setFormData, isLoadingAttendances } = useAttendanceForm({
    attendanceId,
    isEditMode,
  });

  useEffect(() => {
    if (!isEditMode && searchParams) {
      const demandParam = searchParams.get("demand");
      const dateParam = searchParams.get("date");

      if (demandParam || dateParam) {
        setFormData((prev) => ({
          ...prev,
          ...(demandParam && { demand: demandParam }),
          ...(dateParam && {
            date: dateParam.includes("-") ? formatDate(dateParam) : maskDate(dateParam),
          }),
        }));
      }
    }
  }, [isEditMode, searchParams, setFormData]);

  const { student, isLoadingStudent } = useStudentById(studentId);
  const { attendanceTypesOptions } = useAttendanceTypesOptions();

  const [showConfirmRegister, setShowConfirmRegister] = useState(false);

  const baseInputClass =
    "w-full px-3.5 py-2.5 border-[1.5px] rounded-md bg-white text-sm text-stone-800 outline-none transition-colors font-sans";

  const getValidationClass = (field: keyof AttendanceFormErrors) =>
    errors[field]
      ? `${baseInputClass} border-red-300 bg-red-50 focus:border-red-400`
      : `${baseInputClass} border-stone-300 hover:border-stone-400 focus:border-teal-400`;

  const handleFieldChange = (key: keyof AttendanceFormData, value: string) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      setErrors((prevErrors) => ({
        ...prevErrors,
        [key]: validateAttendanceForm(updated)[key],
      }));

      return updated;
    });
  };

  const validateSubmit = () => {
    const validationErrors = validateAttendanceForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return toast.error("Preencha os campos obrigatórios corretamente.");
    }

    setShowConfirmRegister(true);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const payload = formatAttendanceForBackend(formData, studentId);

      if (isEditMode) {
        await attendanceService.update(attendanceId, payload);
        toast.success("Atendimento atualizado com sucesso!");
      } else {
        await attendanceService.create(payload);
        toast.success("Atendimento registrado com sucesso!");
      }

      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro desconhecido.");
      }
    } finally {
      setShowConfirmRegister(false);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM_ATTENDANCE);
    setErrors({});
    setIsSubmitted(false);
  };

  if (isLoadingAttendances || isLoadingStudent) {
    return (
      <div className="flex h-full w-full items-center justify-center p-7">
        <div className="flex flex-col items-center gap-3 text-[#6a6560]">
          <Loader2 className="animate-spin text-[#6bc4a6]" size={32} />
          <p>Carregando dados do aluno...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex min-w-0 flex-1 flex-col h-full font-sans p-7">
        {isSubmitted ? (
          <SuccessScreenForm
            title={`Atendimento ${isEditMode ? "atualizado" : "registrado"}!`}
            message={`O atendimento foi ${isEditMode ? "atualizado" : "registrado"} com sucesso!`}
            listPath={PATHS.visualize_student(studentId)}
            listButtonLabel="Ir para o aluno"
            newButtonLabel="Cadastrar Novamente"
            isEditMode={isEditMode}
            onAddNew={handleReset}
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white border border-[#ece7db] shadow-[0_2px_12px_rgba(0,0,0,0.04)] min-h-0"
          >
            <div className="shrink-0 px-7 pt-7 pb-4">
              <h1 className="m-0 text-2xl font-bold text-stone-800">
                {isEditMode
                  ? "Editar Atendimento"
                  : "Cadastrar Novo Atendimento"}
              </h1>
            </div>

            <div className="flex-1 px-7 pb-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_140px] gap-3.5 mb-3.5">
                <Field label="Aluno (a):" required>
                  <input
                    disabled
                    type="text"
                    placeholder="João Vitor Mesquita da Frota"
                    value={student?.name || ""}
                    className="w-full px-3.5 py-2.5 border-[1.5px] rounded-md bg-white text-sm text-stone-800 outline-none transition-colors font-sans border-stone-300 hover:border-stone-400 focus:border-teal-400 disabled:text-stone-500 disabled:cursor-not-allowed"
                  />
                </Field>
                <Field label="Matrícula:" required>
                  <input
                    disabled
                    type="text"
                    placeholder="12345678"
                    value={student?.enrollmentId || ""}
                    className="w-full px-3.5 py-2.5 border-[1.5px] rounded-md bg-white text-sm text-stone-800 outline-none transition-colors font-sans border-stone-300 hover:border-stone-400 focus:border-teal-400 disabled:text-stone-500 disabled:cursor-not-allowed"
                  />
                </Field>
                <Field label="Data:" error={errors.date} required>
                  <input
                    type="text"
                    placeholder="01/01/2001"
                    value={formData.date}
                    onChange={(e) =>
                      handleFieldChange("date", maskDate(e.target.value))
                    }
                    className={getValidationClass("date")}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-3.5 mb-3.5">
                <Field label="Diagnóstico:" required>
                  <input
                    disabled
                    type="text"
                    placeholder="TDAH, TAG"
                    value={
                      student?.diagnoses
                        ?.map((diag) => diag.acronym)
                        .filter(Boolean)
                        .join(", ") || ""
                    }
                    className="w-full px-3.5 py-2.5 border-[1.5px] rounded-md bg-white text-sm text-stone-800 outline-none transition-colors font-sans border-stone-300 hover:border-stone-400 focus:border-teal-400 disabled:text-stone-500 disabled:cursor-not-allowed"
                  />
                </Field>
                <CustomSelect
                  value={formData.typeId}
                  label="Tipo de Atendimento:"
                  error={errors.typeId}
                  onChange={(val) => handleFieldChange("typeId", val)}
                  options={attendanceTypesOptions}
                  required
                />
              </div>

              <div className="mb-3.5">
                <Field label="Demanda Relatada:">
                  <textarea
                    placeholder="Realiza atividades em grupo..."
                    value={formData.demand ?? ""}
                    onChange={(e) =>
                      handleFieldChange("demand", e.target.value)
                    }
                    rows={2}
                    className={`${baseInputClass} resize-y leading-relaxed min-h-16 border-stone-300 focus:border-teal-400`}
                  />
                </Field>
              </div>

              <div className="mb-1.5">
                <Field label="Observações gerais:">
                  <textarea
                    placeholder="Insira suas observações sobre o que foi relatado..."
                    value={formData.generalObservations ?? ""}
                    onChange={(e) =>
                      handleFieldChange("generalObservations", e.target.value)
                    }
                    rows={5}
                    className={`${baseInputClass} resize-y leading-relaxed min-h-30 bg-stone-50 border-stone-300 focus:bg-white focus:border-teal-400`}
                  />
                </Field>
              </div>
            </div>

            <div className="shrink-0 p-4 px-7 flex justify-end gap-3 border-t border-stone-200 bg-stone-50/50">
              <CommonButton
                label="Cancelar"
                onClick={onCancel || handleReset}
                type="button"
                className="bg-[#f4a598] text-white hover:bg-[#f0a195]"
              />
              <CommonButton
                label={isEditMode ? "Salvar Alterações" : "Confirmar Registro"}
                type="button"
                onClick={validateSubmit}
                isLoading={isLoading}
                loadingLabel="Salvando..."
              />
            </div>
          </form>
        )}
      </main>

      {/* ── Confirm Modal to Update/Create Attendance ── */}
      <ConfirmModal
        open={showConfirmRegister}
        title={isEditMode ? "Atualizar Atendimento" : "Registrar Atendimento"}
        message={
          isEditMode
            ? `Tem certeza que deseja atualizar o atendimento?`
            : `Tem certeza que deseja cadastrar o atendimento?`
        }
        confirmLabel={isEditMode ? "Atualizar" : "Cadastrar"}
        confirmColor="primary"
        isLoading={isLoading}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirmRegister(false)}
      />
    </>
  );
}
