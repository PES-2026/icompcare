import { AppointmentGuest } from "@domain/entities/appointmentGuest";
import { AppointmentStatusEnum } from "@domain/enum/appointmentStatus";
import { AppointmentType } from "@domain/enum/appointmentType";
import { IAppointmentGuestRepository } from "@domain/repositories/appointmentGuestRepository";
import { AppointmentListParams } from "@domain/repositories/filters/appointmentFilters";
import { PaginatedAppointmentResult, AppointmentResult } from "@domain/repositories/results/appointmentResult";
import { findValueInEnum } from "@domain/utils/enumUtils";
import { AppointmentStatusVO } from "@domain/valueObjects/appointment/appointmentStatus";
import { Prisma, PrismaClient, AppointmentStatus } from "@prisma/src/infrastructure/database/generated/client";

export class PrismaAppointmentGuestRepository implements IAppointmentGuestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToResult(
    data: Prisma.AppointmentGuestGetPayload<{ include: { pedagogue: true; course: true; availability: true } }>,
  ): AppointmentResult {
    return {
      id: data.externalId,
      pedagogueId: data.pedagogue.externalId,
      studentId: "Guest student",
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      studentEnrollment: data.studentEnrollment,
      studentCourse: data.course.name,
      availabilityId: data.availability.externalId,
      startDate: data.availability.startDateTime,
      endDate: data.availability.endDateTime,
      attendanceTime: data.availability.attendanceTime,
      status: findValueInEnum(AppointmentStatusEnum, data.status),
      token: data.token,
      reason: data.reason ?? "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      type: AppointmentType.GUEST,
    };
  }

  async findById(id: string): Promise<AppointmentResult | null> {
    const raw = await this.prisma.appointmentGuest.findUnique({
      where: { externalId: id, removed: false },
      include: { pedagogue: true, course: true, availability: true },
    });

    if (!raw) return null;

    return this.mapToResult(raw);
  }

  async findByToken(token: string): Promise<AppointmentResult | null> {
    const raw = await this.prisma.appointmentGuest.findUnique({
      where: { token: token, removed: false },
      include: { pedagogue: true, course: true, availability: true },
    });

    if (!raw) return null;

    return this.mapToResult(raw);
  }

  async findByPedagogueId(pedagogueId: string): Promise<AppointmentResult[]> {
    const results = await this.prisma.appointmentGuest.findMany({
      where: {
        pedagogue: { externalId: pedagogueId },
        removed: false,
      },
      include: { pedagogue: true, course: true, availability: true },
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

    const where: Prisma.AppointmentGuestWhereInput = {
      removed: false,
      ...(pedagogue && { pedagogueId: pedagogue.internalId }),
      ...(filters.status && { status: filters.status as AppointmentStatus }),
      ...(filters.startDate && { availability: { startDateTime: { gte: filters.startDate } } }),
      ...(filters.endDate && { availability: { endDateTime: { lte: filters.endDate } } }),
      ...(filters.studentName && { studentEmail: filters.studentName }),
      ...(filters.studentEmail && { studentEmail: filters.studentEmail }),
      ...(filters.studentEnrollment && { studentEmail: filters.studentName }),
      ...(filters.studentCourse && { course: { name: { contains: filters.studentCourse, mode: "insensitive" } } }),
    };

    const [totalItems, results] = await Promise.all([
      this.prisma.appointmentGuest.count({ where }),
      this.prisma.appointmentGuest.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { availability: { startDateTime: "desc" } },
        include: { pedagogue: true, course: true, availability: true },
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

  async save(appointmentGuest: AppointmentGuest): Promise<void> {
    await this.prisma.appointmentGuest.create({
      data: {
        externalId: appointmentGuest.id.value,
        pedagogue: { connect: { externalId: appointmentGuest.pedagogueId.value } },
        availability: { connect: { externalId: appointmentGuest.availabilityId.value } },
        studentName: appointmentGuest.studentName.value,
        studentEmail: appointmentGuest.studentEmail.value,
        studentEnrollment: appointmentGuest.studentEnrollment.value,
        course: { connect: { externalId: appointmentGuest.courseId.value } },
        status: appointmentGuest.status.value,
        token: appointmentGuest.token.value,
        reason: appointmentGuest.reason?.value ?? null,
        removed: appointmentGuest.removed,
      },
    });
  }

  async updateStatus(appointmentId: string, newStatus: AppointmentStatusVO, reason?: string): Promise<void> {
    await this.prisma.appointmentGuest.update({
      where: { externalId: appointmentId },
      data: {
        status: newStatus.value,
        reason: reason ?? "",
      },
    });
  }

  async update(appointmentGuest: AppointmentGuest): Promise<void> {
    await this.prisma.appointmentGuest.update({
      where: { externalId: appointmentGuest.id.value },
      data: {
        pedagogue: { connect: { externalId: appointmentGuest.pedagogueId.value } },
        availability: { connect: { externalId: appointmentGuest.availabilityId.value } },
        studentName: appointmentGuest.studentName.value,
        studentEmail: appointmentGuest.studentEmail.value,
        studentEnrollment: appointmentGuest.studentEnrollment.value,
        course: { connect: { externalId: appointmentGuest.courseId.value } },
        status: appointmentGuest.status.value,
        token: appointmentGuest.token.value,
        reason: appointmentGuest.reason?.value ?? null,
        removed: appointmentGuest.removed,
      },
    });
  }
}
