import { Appointment } from "@domain/entities/appointment";
import { AppointmentStatusEnum } from "@domain/enum/appointmentStatus";
import { AppointmentType } from "@domain/enum/appointmentType";
import { IAppointmentRepository } from "@domain/repositories/appointmentRepository";
import { AppointmentListParams } from "@domain/repositories/filters/appointmentFilters";
import { PaginatedAppointmentResult, AppointmentResult } from "@domain/repositories/results/appointmentResult";
import { findValueInEnum } from "@domain/utils/enumUtils";
import { AppointmentStatusVO } from "@domain/valueObjects/appointment/appointmentStatus";
import { Prisma, PrismaClient, AppointmentStatus } from "@prisma/src/infrastructure/database/generated/client";

export class PrismaAppointmentRepository implements IAppointmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToResult(
    data: Prisma.AppointmentGetPayload<{
      include: { pedagogue: true; student: { include: { course: true } }; availability: true };
    }>,
  ): AppointmentResult {
    return {
      id: data.externalId,
      pedagogueId: data.pedagogue.externalId,
      studentId: data.student.externalId,
      studentName: data.student.name,
      studentEmail: data.student.email,
      studentEnrollment: data.student.enrollmentId,
      studentCourse: data.student.course.name,
      availabilityId: data.availability.externalId,
      startDate: data.availability.startDateTime,
      endDate: data.availability.endDateTime,
      attendanceTime: data.availability.attendanceTime,
      status: findValueInEnum(AppointmentStatusEnum, data.status),
      token: data.token,
      reason: data.reason ?? "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      type: AppointmentType.STUDENT,
    };
  }

  async findById(id: string): Promise<AppointmentResult | null> {
    const raw = await this.prisma.appointment.findUnique({
      where: { externalId: id },
      include: { pedagogue: true, student: { include: { course: true } }, availability: true },
    });

    if (!raw) return null;

    return this.mapToResult(raw);
  }

  async findByToken(token: string): Promise<AppointmentResult | null> {
    const raw = await this.prisma.appointment.findUnique({
      where: { token: token },
      include: { pedagogue: true, student: { include: { course: true } }, availability: true },
    });

    if (!raw) return null;

    return this.mapToResult(raw);
  }

  async findByPedagogueId(pedagogueId: string): Promise<AppointmentResult[]> {
    const results = await this.prisma.appointment.findMany({
      where: {
        pedagogue: { externalId: pedagogueId },
        removed: false,
      },
      include: { pedagogue: true, student: { include: { course: true } }, availability: true },
    });

    const resultsMapped: AppointmentResult[] = results.map((raw) => this.mapToResult(raw));

    return resultsMapped;
  }

  async findAll(params: AppointmentListParams): Promise<PaginatedAppointmentResult> {
    const { page, limit, filters } = params;
    const offset = (page - 1) * limit;

    const pedagogue = filters.pedagogueId
      ? await this.prisma.pedagogue.findUnique({
          where: { externalId: filters.pedagogueId, removed: false },
          select: { internalId: true },
        })
      : null;

    const where: Prisma.AppointmentWhereInput = {
      removed: false,
      ...(pedagogue && { pedagogueId: pedagogue.internalId }),
      ...(filters.status && { status: filters.status as AppointmentStatus }),
      ...(filters.startDate && { availability: { startDateTime: { gte: filters.startDate } } }),
      ...(filters.endDate && { availability: { endDateTime: { lte: filters.endDate } } }),
      ...(filters.studentName && { student: { name: { contains: filters.studentName, mode: "insensitive" } } }),
      ...(filters.studentEmail && { student: { email: { contains: filters.studentEmail, mode: "insensitive" } } }),
      ...(filters.studentEnrollment && {
        student: {
          enrollmentId: { contains: filters.studentEnrollment, mode: "insensitive" },
        },
      }),
      ...(filters.studentCourse && {
        student: {
          course: {
            OR: [
              { name: { contains: filters.studentCourse, mode: "insensitive" } },
              { acronym: { contains: filters.studentCourse, mode: "insensitive" } },
            ],
          },
        },
      }),
    };

    const [totalItems, results] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { availability: { startDateTime: "desc" } },
        include: {
          pedagogue: true,
          student: {
            include: { course: true },
          },
          availability: true,
        },
      }),
    ]);

    const items: AppointmentResult[] = results.map((raw) => this.mapToResult(raw));

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      items,
    };
  }

  async save(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.create({
      data: {
        externalId: appointment.id.value,
        pedagogue: { connect: { externalId: appointment.pedagogueId.value } },
        availability: { connect: { externalId: appointment.availabilityId.value } },
        student: { connect: { externalId: appointment.studentId.value } },
        status: appointment.status.value,
        token: appointment.token.value,
        reason: appointment.reason?.value ?? null,
        removed: appointment.removed,
      },
    });
  }

  async updateStatus(appointmentId: string, newStatus: AppointmentStatusVO, reason?: string): Promise<void> {
    await this.prisma.appointment.update({
      where: { externalId: appointmentId },
      data: {
        status: newStatus.value,
        reason: reason ?? "",
      },
    });
  }

  async update(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.update({
      where: { externalId: appointment.id.value },
      data: {
        pedagogue: { connect: { externalId: appointment.pedagogueId.value } },
        availability: { connect: { externalId: appointment.availabilityId.value } },
        student: { connect: { externalId: appointment.studentId.value } },
        status: appointment.status.value,
        token: appointment.token.value,
        reason: appointment.reason?.value ?? null,
        removed: appointment.removed,
      },
    });
  }
}
