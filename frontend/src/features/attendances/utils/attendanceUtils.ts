import { formatDate } from "@/utils/utils";
import {
  Attendance,
  AttendanceFormData,
  AttendanceFormErrors,
} from "../types/attendance";

export const EMPTY_FORM_ATTENDANCE: AttendanceFormData = {
  studentId: "",
  date: "",
  typeId: "",
  demand: "",
  generalObservations: "",
};

export const validateAttendanceForm = (
  data: AttendanceFormData,
): AttendanceFormErrors => {
  const errs: AttendanceFormErrors = {};

  if (!data.typeId) errs.typeId = "Selecione o tipo";
  if (!data.demand) errs.demand = "A demanda é obrigatória";
  if (!data.date) errs.date = "A data é obrigátoria";

  return errs;
};

export const formatAttendanceForBackend = (
  data: AttendanceFormData,
  studentId: string,
) => {
  const [day, month, year] = data.date.split("/");
  const attendanceDate = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

  return {
    ...data,
    studentId,
    date: isNaN(attendanceDate.getTime()) ? data.date : attendanceDate.toISOString(),
  };
};

export const formatAttendanceForFrontend = (data: any): AttendanceFormData => {
  return {
    ...data,
    date: formatDate(data.date),
  };
};

export const formatGetAttendanceForFrontend = (
  data: Attendance,
): Attendance => {
  return {
    ...data,
    date: formatDate(data.date),
  };
};

export const formatGetAttendancesForFrontend = (
  data: Attendance[],
): Attendance[] => {
  return data.map((item) => {
    return formatGetAttendanceForFrontend(item);
  });
};
