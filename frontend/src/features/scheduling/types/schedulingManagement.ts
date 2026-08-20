import { Course } from "@/features/courses/types/course";
import { SchedulingSlot } from "./scheduling";

export enum ScheduleStatusEnum {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
  CANCELED_BY_STUDENT = "CANCELED_BY_STUDENT",
  CANCELED_BY_PEDAGOGUE = "CANCELED_BY_PEDAGOGUE",
  EXPIRED = "EXPIRED",
  COMPLETED = "COMPLETED",
  DONE = "DONE",
  MISSED = "MISSED",
  ABSENT = "ABSENT",
}

export interface ListScheduleFilters {
  status?: ScheduleStatusEnum;
  startDate?: string;
  endDate?: string;
  pedagogueId?: string;
  studentName?: string;
  studentEmail?: string;
  studentCourse?: string;
  studentEnrollment?: string;
  guestName?: string;
  guestEmail?: string;
  date?: string;
}

export interface ScheduleItem {
  id: string;
  pedagogueId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentEnrollment: string;
  studentCourse: string;
  startDate: string;
  endDate: string;
  status: ScheduleStatusEnum;
  reason: string;
  createdAt: string;
  updatedAt: string;
  type: string;
}

export interface PaginatedScheduleResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  items: ScheduleItem[];
}

export type ManagedSchedulingStatus =
  | "PENDING"
  | "APPROVED"
  | "CANCELED"
  | "FINISHED";

export type ManagedSchedulingPeriod =
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "CUSTOM";

export interface ManagedScheduling {
  id: string;
  pedagogueId: string;

  enrollmentId: number;
  studentId?: string;
  studentName: string;
  email: string;
  course: Course;

  status: ManagedSchedulingStatus;
  reason: string;
  slot: SchedulingSlot;
  rejectionReason?: string;
  cancellationReason?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ManagedSchedulingFilters {
  startDate: string;
  endDate?: string;
  statuses: ManagedSchedulingStatus[];
  pedagogueId?: string;
  search?: string;
}

export interface ManagedSchedulingActionResult {
  scheduling: ScheduleItem;
  outcome: "CONFIRMED" | "REJECTED" | "CANCELED" | "FINISHED";
  emailNotificationQueued: boolean;
  slotReleased: boolean;
}
