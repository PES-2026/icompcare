import { Diagnostic } from "@/features/diagnostics/types/diagnostic";
import { formatDate, maskPhone, maskRegistration } from "@/utils/utils";
import { FormErrors, Student, StudentFormData } from "../types/student";

export const EMPTY_FORM_STUDENT: StudentFormData = {
  id: "",
  enrollmentId: "",
  name: "",
  dtBirth: "",
  email: "",
  phoneNumber: "",
  courseId: "",
  diagnoses: [],
  potential: "",
  difficulties: "",
};

export const validateStudentForm = (data: StudentFormData): FormErrors => {
  const errs: FormErrors = {};

  if (!data.name.trim() || data.name.trim().length < 5)
    errs.name = "Mínimo 5 caracteres";
  if (data.enrollmentId.replace(/\D/g, "").length < 8)
    errs.enrollmentId = "Mínimo 8 dígitos";
  if (data.dtBirth.length < 10) errs.dtBirth = "Data inválida";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errs.email = "E-mail inválido";
  if (data.phoneNumber.replace(/\D/g, "").length < 10)
    errs.phoneNumber = "Telefone inválido";
  if (!data.courseId) errs.courseId = "Selecione um curso";

  return errs;
};

export const formatForBackend = (data: StudentFormData) => {
  const [day, month, year] = data.dtBirth.split("/");
  const birthDate = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

  const { id: externalId, ...restData } = data;

  return {
    ...restData,
    dtBirth: isNaN(birthDate.getTime()) ? data.dtBirth : birthDate.toISOString(),
    enrollmentId: data.enrollmentId.replace(/\D/g, ""),
    phoneNumber: data.phoneNumber.replace(/\D/g, ""),
  };
};

export const formatForFrontend = (dataFromAPI: any): StudentFormData => {
  return {
    ...dataFromAPI,
    courseId: dataFromAPI.course,
    dtBirth: formatDate(dataFromAPI.dtBirth),
    enrollmentId: maskRegistration(dataFromAPI.enrollmentId),
    phoneNumber: maskPhone(dataFromAPI.phoneNumber),
  };
};

export const formatFormForFrontend = (student: Student): StudentFormData => {
  console.log(student);
  return {
    id: student.id,
    enrollmentId: maskRegistration(student.enrollmentId),
    name: student.name,
    dtBirth: formatDate(student.dtBirth),
    email: student.email,
    phoneNumber: maskPhone(student.phoneNumber),
    courseId: student?.course?.id || "",
    diagnoses:
      student?.diagnoses?.map((diag: Diagnostic) => diag?.id || "") || [],
    potential: student.potential,
    difficulties: student.difficulties,
  };
};

export const formatGetStudentForFrontend = (data: any): Student => {
  return {
    ...data,
    dtBirth: formatDate(data.dtBirth),
    createdAt: formatDate(data.createdAt),
    updatedAt: formatDate(data.updatedAt),
    phoneNumber: maskPhone(data.phoneNumber),
  };
};
