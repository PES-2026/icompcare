"use client";

import CommonButton from "@/components/ui/CommonButton";
import { CustomMultiSelect } from "@/components/ui/CustomMultiSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Field } from "@/components/ui/Field";
import { useCoursesOptions } from "@/features/courses/hooks/useCoursesOptions";
import { useDiagnosticsOptions } from "@/features/diagnostics/hooks/useDiagnosticsOptions";
import { studentService } from "@/features/students/services/studentService";
import { FormErrors, StudentFormData } from "@/features/students/types/student";
import {
  formatForBackend,
  validateStudentForm,
} from "@/features/students/utils/studentUtils";
import { maskDate, maskPhone, maskRegistration } from "@/utils/utils";
import { Loader2, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ScheduleItem } from "../../types/schedulingManagement";

interface CreateStudentFromAppointmentModalProps {
  scheduling: ScheduleItem | null;
  onClose: () => void;
  onSuccess: (studentId: string) => void;
}

export default function CreateStudentFromAppointmentModal({
  scheduling,
  onClose,
  onSuccess,
}: CreateStudentFromAppointmentModalProps) {
  const { coursesOptions } = useCoursesOptions();
  const { diagnosticsOptions } = useDiagnosticsOptions();

  const [formData, setFormData] = useState<StudentFormData>({
    id: "",
    name: "",
    enrollmentId: "",
    email: "",
    phoneNumber: "",
    dtBirth: "",
    courseId: "",
    diagnoses: [],
    potential: "",
    difficulties: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (scheduling) {
      const matchedCourse = coursesOptions.find(
        (c) =>
          c.label.toLowerCase() === scheduling.studentCourse?.toLowerCase() ||
          c.value === scheduling.studentCourse,
      );

      setFormData({
        id: "",
        name: scheduling.studentName || "",
        enrollmentId: maskRegistration(scheduling.studentEnrollment || ""),
        email: scheduling.studentEmail || "",
        phoneNumber: "",
        dtBirth: "",
        courseId: matchedCourse?.value || "",
        diagnoses: [],
        potential: "",
        difficulties: "",
      });
      setErrors({});
    }
  }, [scheduling, coursesOptions]);

  if (!scheduling) return null;

  const baseInputClass =
    "w-full px-3.5 py-2.5 border-[1.5px] rounded-md bg-white text-sm text-stone-800 outline-none transition-colors font-sans";

  const getValidationClass = (field: keyof FormErrors) =>
    errors[field]
      ? `${baseInputClass} border-red-300 bg-red-50 focus:border-red-400`
      : `${baseInputClass} border-stone-300 hover:border-stone-400 focus:border-teal-400`;

  const handleFieldChange = <K extends keyof StudentFormData>(
    key: K,
    value: StudentFormData[K],
  ) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      setErrors((prevErrors) => ({
        ...prevErrors,
        [key]: validateStudentForm(updated)[key],
      }));

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateStudentForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Preencha os campos obrigatórios corretamente.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = formatForBackend(formData);
      const created = await studentService.createStudent(payload as any);
      toast.success("Aluno cadastrado com sucesso!");
      onSuccess(created.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao cadastrar o aluno.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      onClick={isSubmitting ? undefined : onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-student-from-appointment-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <UserPlus size={22} />
            </div>
            <div>
              <h2
                id="create-student-from-appointment-title"
                className="text-xl font-bold text-[#3a3530]"
              >
                Cadastrar Aluno para Atendimento
              </h2>
              <p className="mt-0.5 text-sm text-stone-500">
                Confirme e edite os dados do aluno antes de iniciar o atendimento.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={isSubmitting ? undefined : onClose}
            className="cursor-pointer rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nome Completo *" error={errors.name}>
                <input
                  type="text"
                  placeholder="Nome do discente"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={getValidationClass("name")}
                  disabled={isSubmitting}
                />
              </Field>
            </div>

            <div>
              <Field label="Matrícula *" error={errors.enrollmentId}>
                <input
                  type="text"
                  placeholder="00000000"
                  maxLength={8}
                  value={formData.enrollmentId}
                  onChange={(e) =>
                    handleFieldChange(
                      "enrollmentId",
                      maskRegistration(e.target.value),
                    )
                  }
                  className={getValidationClass("enrollmentId")}
                  disabled={isSubmitting}
                />
              </Field>
            </div>

            <div>
              <Field label="E-mail *" error={errors.email}>
                <input
                  type="email"
                  placeholder="exemplo@ufam.edu.br"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className={getValidationClass("email")}
                  disabled={isSubmitting}
                />
              </Field>
            </div>

            <div>
              <Field label="Data de Nascimento *" error={errors.dtBirth}>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  value={formData.dtBirth}
                  onChange={(e) =>
                    handleFieldChange("dtBirth", maskDate(e.target.value))
                  }
                  className={getValidationClass("dtBirth")}
                  disabled={isSubmitting}
                />
              </Field>
            </div>

            <div>
              <Field label="Telefone *" error={errors.phoneNumber}>
                <input
                  type="text"
                  placeholder="(92) 90000-0000"
                  maxLength={15}
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleFieldChange("phoneNumber", maskPhone(e.target.value))
                  }
                  className={getValidationClass("phoneNumber")}
                  disabled={isSubmitting}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <CustomSelect
                label="Curso *"
                options={coursesOptions}
                value={formData.courseId}
                onChange={(val) => handleFieldChange("courseId", val)}
                placeholder="Selecione um curso"
                error={errors.courseId}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <CustomMultiSelect
                label="Diagnósticos (opcional)"
                options={diagnosticsOptions}
                value={formData.diagnoses}
                onChange={(val) => handleFieldChange("diagnoses", val)}
                placeholder="Selecione diagnósticos se houver"
              />
            </div>

            <div className="sm:col-span-2">
              <Field label="Potencialidades (opcional)">
                <textarea
                  rows={2}
                  placeholder="Principais facilidades e habilidades do aluno"
                  value={formData.potential}
                  onChange={(e) => handleFieldChange("potential", e.target.value)}
                  className={`${baseInputClass} resize-none border-stone-300`}
                  disabled={isSubmitting}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Dificuldades (opcional)">
                <textarea
                  rows={2}
                  placeholder="Principais desafios pedagógicos ou de adaptação"
                  value={formData.difficulties}
                  onChange={(e) =>
                    handleFieldChange("difficulties", e.target.value)
                  }
                  className={`${baseInputClass} resize-none border-stone-300`}
                  disabled={isSubmitting}
                />
              </Field>
            </div>
          </div>

          <footer className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-stone-100 pt-4 sm:flex-row">
            <CommonButton
              label="Cancelar"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full justify-center bg-stone-100 text-stone-600 hover:bg-stone-200 sm:w-auto"
            />
            <CommonButton
              label={isSubmitting ? "Cadastrando..." : "Cadastrar e Ir para Atendimento"}
              type="submit"
              startIcon={isSubmitting ? Loader2 : undefined}
              disabled={isSubmitting}
              className="w-full justify-center bg-teal-600 text-white hover:bg-teal-700 sm:w-auto [&_svg]:animate-spin"
            />
          </footer>
        </form>
      </section>
    </div>
  );
}
