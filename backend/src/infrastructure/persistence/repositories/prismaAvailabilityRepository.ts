import { Availability } from "@domain/entities/availability";
import { AppointmentType } from "@domain/enum/appointmentType";
import { AvailabilityStatusEnum } from "@domain/enum/availabilityStatus";
import { DaysOfWeekEnum } from "@domain/enum/daysOfWeek";
import { IAvailabilityRepository } from "@domain/repositories/availabilityRepository";
import { AvailabilityListParams } from "@domain/repositories/filters/availabilityFilters";
import { PaginatedAvailabilityResult, AvailabilityResult } from "@domain/repositories/results/availabilityResult";
import { findValueInEnum } from "@domain/utils/enumUtils";
import {
  Prisma,
  PrismaClient,
  Appointment,
  AppointmentGuest,
} from "@prisma/src/infrastructure/database/generated/client";

export class PrismaAvailabilityRepository implements IAvailabilityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToResult(
    data: Prisma.AvailabilityGetPayload<{ include: { appointment: true; appointmentGuest: true; pedagogue: true } }>,
    pedagogueId?: string,
  ): AvailabilityResult {
    return {
      id: data.externalId,
      pedagogueId: pedagogueId ?? data.pedagogue.externalId,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      attendanceTime: data.attendanceTime,
      appointmentId: data.appointment?.externalId ?? data.appointmentGuest?.externalId ?? undefined,
      status: findValueInEnum(AvailabilityStatusEnum, data.status),
      weekDay: findValueInEnum(DaysOfWeekEnum, data.weekDay),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async save(availability: Availability): Promise<void> {
    const data: Prisma.AvailabilityCreateInput = {
      externalId: availability.id.value,
      pedagogue: { connect: { externalId: availability.pedagogueId.value } },
      startDateTime: availability.startDateTime.value,
      endDateTime: availability.endDateTime.value,
      attendanceTime: availability.attendanceTime.value,
      status: availability.status.value,
      weekDay: availability.dayOfWeek.value,
    };

    await this.prisma.availability.create({ data });
  }

  async saveMany(availabilities: Availability[]): Promise<void> {
    if (availabilities.length === 0) return;

    const pedagogueExternalId = availabilities[0]!.pedagogueId.value;
    const pedagogue = await this.prisma.pedagogue.findUnique({
      where: { externalId: pedagogueExternalId },
      select: { internalId: true },
    });

    if (!pedagogue) throw new Error(`Pedagogue with ID ${pedagogueExternalId} not found`);

    await this.prisma.availability.createMany({
      data: availabilities.map((availability) => ({
        externalId: availability.id.value,
        pedagogueId: pedagogue.internalId,
        startDateTime: availability.startDateTime.value,
        endDateTime: availability.endDateTime.value,
        attendanceTime: availability.attendanceTime.value,
        status: availability.status.value,
        weekDay: availability.dayOfWeek.value,
      })),
    });
  }

  async findAllAvailabilitiesByRange(
    pedagogueId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailabilityResult[]> {
    const pedagogue = await this.prisma.pedagogue.findUnique({
      where: { externalId: pedagogueId, removed: false },
      select: { internalId: true },
    });

    if (!pedagogue) return [];

    const availabilities = await this.prisma.availability.findMany({
      where: {
        pedagogueId: pedagogue.internalId,
        startDateTime: { gte: startDate },
        endDateTime: { lte: endDate },
        removed: false,
      },
      include: {
        appointment: true,
        appointmentGuest: true,
        pedagogue: true,
      },
    });

    return availabilities.map((availability) => this.mapToResult(availability, pedagogueId));
  }

  async findById(id: string): Promise<AvailabilityResult | null> {
    const availability = await this.prisma.availability.findUnique({
      where: {
        externalId: id,
        removed: false,
      },
      include: { pedagogue: true, appointment: true, appointmentGuest: true },
    });

    if (!availability) return null;

    return this.mapToResult(availability);
  }

  async findAll(params: AvailabilityListParams): Promise<PaginatedAvailabilityResult> {
    const { page, limit, filters } = params;
    const offset = (page - 1) * limit;

    let pedagogueInternalId: number | undefined;
    if (filters.pedagogueId) {
      const pedagogue = await this.prisma.pedagogue.findFirst({
        where: { externalId: filters.pedagogueId, removed: false },
        select: { internalId: true },
      });
      if (!pedagogue) {
        return {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          items: [],
        };
      }
      pedagogueInternalId = pedagogue.internalId;
    }

    const where: Prisma.AvailabilityWhereInput = {
      ...(pedagogueInternalId !== undefined && { pedagogueId: pedagogueInternalId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.attendanceTime && { attendanceTime: filters.attendanceTime }),
      ...(filters.startDate && { startDateTime: { gte: filters.startDate } }),
      ...(filters.endDate && { endDateTime: { lte: filters.endDate } }),
      removed: false,
    };

    const [totalItems, results] = await Promise.all([
      this.prisma.availability.count({ where }),
      this.prisma.availability.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { startDateTime: "asc" },
        include: {
          appointment: true,
          appointmentGuest: true,
          pedagogue: true,
        },
      }),
    ]);

    const items: AvailabilityResult[] = results.map((availability) => this.mapToResult(availability));

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      items,
    };
  }

  async remove(id: string): Promise<boolean> {
    try {
      await this.prisma.availability.update({
        where: { externalId: id },
        data: { removed: true, status: AvailabilityStatusEnum.REMOVED },
      });
      return true;
    } catch (_error) {
      return false;
    }
  }

  async removeMany(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await this.prisma.availability.updateMany({
      where: {
        externalId: { in: ids },
      },
      data: {
        status: AvailabilityStatusEnum.REMOVED,
        removed: true,
      },
    });

    return result.count;
  }

  async existsByUUID(id: string): Promise<boolean> {
    const slot = await this.prisma.availability.findUnique({
      where: { externalId: id, removed: false },
      select: { internalId: true },
    });
    return !!slot;
  }

  /* This function does not disconnect the Availability from appointment, it only makes a soft-delete. 
    It's necessary to the create a clone of the availability after this release. 
    Verify what was made on the releaseAvability useCase. 
  */
  async releaseAvailabilityById(availabilityId: string): Promise<void> {
    await this.prisma.availability.update({
      where: {
        externalId: availabilityId,
      },
      data: {
        status: AvailabilityStatusEnum.REMOVED,
        removed: true,
      },
    });
  }

  async bookAvailabilityById(id: string, appointmentId: string, appointmentType: AppointmentType): Promise<void> {
    let appointment: Appointment | AppointmentGuest | null = null;
    if (appointmentType === AppointmentType.GUEST) {
      appointment = await this.prisma.appointmentGuest.findUnique({
        where: { externalId: appointmentId },
      });
      await this.prisma.availability.update({
        where: {
          externalId: id,
        },
        data: {
          status: AvailabilityStatusEnum.PENDING,
          appointmentGuest: { connect: { externalId: appointmentId } },
        },
      });
    } else if (appointmentType === AppointmentType.STUDENT) {
      appointment = await this.prisma.appointment.findUnique({
        where: { externalId: appointmentId },
      });
      await this.prisma.availability.update({
        where: {
          externalId: id,
        },
        data: {
          status: AvailabilityStatusEnum.PENDING,
          appointment: { connect: { externalId: appointmentId } },
        },
      });
    }

    if (!appointment) throw new Error(`Appointment ${appointmentId} was not found as guest or student`);
  }
}
