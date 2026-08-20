import { CreateAvailabilityDTO, CreateAvailabilityItemDTO } from "@application/dtos/availability/createAvailability";
import { ApplicationError } from "@application/errors/applicationError";
import { AppointmentConflictError } from "@application/errors/appointment/appointmentConflictError";
import { DateIntegrityError } from "@application/errors/availability/dateIntegrityError";
import { PedagogueNotFoundError } from "@application/errors/pedagogue/pedagogueNotFoundError";
import { Availability } from "@domain/entities/availability";
import { AvailabilityStatusEnum } from "@domain/enum/availabilityStatus";
import { DaysOfWeekEnum } from "@domain/enum/daysOfWeek";
import { DomainError } from "@domain/errors/domainError";
import { IAvailabilityRepository } from "@domain/repositories/availabilityRepository";
import { IPedagogueRepository } from "@domain/repositories/pedagogueRepository";
import { AvailabilityResult } from "@domain/repositories/results/availabilityResult";
import { Result } from "@domain/shared/result";
import { formatTime } from "@domain/utils/timeUtils";

import { GetWeekdayFromDate } from "./getWeekdayFromDate";

export class CreateAvailability {
  constructor(
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly pedagogueRepository: IPedagogueRepository,
    private readonly getWeekdayFromDate: GetWeekdayFromDate,
  ) {}

  async execute(
    dto: CreateAvailabilityDTO,
  ): Promise<Result<Array<AvailabilityResult>, ApplicationError | DomainError>> {
    const uniquePedagogueIds = [...new Set(dto.items.map((item) => item.pedagogueId))];
    const pedagoguesValidation = await this.validateWhetherPedagogueExists(uniquePedagogueIds);

    if (pedagoguesValidation.isFailure) {
      return Result.fail(pedagoguesValidation.error!);
    }

    const slotsToSave: Array<Availability> = [];
    const responseItems: Array<AvailabilityResult> = [];

    for (const item of dto.items) {
      const weekDayValidation = this.validateWeekDay(item.date, item.weekday);

      if (weekDayValidation.isFailure) {
        return Result.fail(weekDayValidation.error!);
      }

      const startDateTime = new Date(item.start);
      const endDateTime = new Date(item.end);

      const overlapValidation = await this.validateSlotOverlap(item, startDateTime, endDateTime);

      if (overlapValidation.isFailure) {
        return Result.fail(overlapValidation.error!);
      }

      const slotResult = Availability.create({
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        status: AvailabilityStatusEnum.CREATED,
        attendanceTime: item.attendanceTime,
        pedagogueId: item.pedagogueId,
        dayOfWeek: item.weekday,
      });

      if (slotResult.isFailure) {
        return Result.fail(slotResult.error!);
      }

      const slot = slotResult.getValue();
      slotsToSave.push(slot);

      responseItems.push({
        id: slot.id.value,
        status: AvailabilityStatusEnum.CREATED,
        weekDay: item.weekday,
        pedagogueId: item.pedagogueId,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        attendanceTime: item.attendanceTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (slotsToSave.length > 0) {
      await this.availabilityRepository.saveMany(slotsToSave);
    }

    return Result.ok<Array<AvailabilityResult>>(responseItems);
  }

  private async validateWhetherPedagogueExists(pedagoguesIds: Array<string>) {
    for (const pedagogueId of pedagoguesIds) {
      const pedagogue = await this.pedagogueRepository.findById(pedagogueId);
      if (!pedagogue) {
        return Result.fail(new PedagogueNotFoundError());
      }
    }
    return Result.ok();
  }

  private validateWeekDay(date: Date, weekday: DaysOfWeekEnum) {
    const actualWeekday = this.getWeekdayFromDate.execute(date);

    if (actualWeekday !== weekday) {
      return Result.fail(new DateIntegrityError(date.toDateString(), actualWeekday, weekday));
    }
    return Result.ok();
  }

  private async validateSlotOverlap(item: CreateAvailabilityItemDTO, startDateTime: Date, endDateTime: Date) {
    const startOfDay = new Date(Date.UTC(startDateTime.getUTCFullYear(), startDateTime.getUTCMonth(), startDateTime.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(startDateTime.getUTCFullYear(), startDateTime.getUTCMonth(), startDateTime.getUTCDate(), 23, 59, 59, 999));

    const existingSlots = await this.availabilityRepository.findAllAvailabilitiesByRange(
      item.pedagogueId,
      startOfDay,
      endOfDay,
    );

    const hasConflict = existingSlots.some(
      (slot) =>
        (startDateTime >= slot.startDateTime && startDateTime < slot.endDateTime) ||
        (endDateTime > slot.startDateTime && endDateTime <= slot.endDateTime) ||
        (startDateTime <= slot.startDateTime && endDateTime >= slot.endDateTime),
    );

    if (hasConflict) {
      return Result.fail(
        new AppointmentConflictError(
          item.pedagogueId,
          formatTime(item.start),
          formatTime(item.end),
          item.date.toDateString(),
        ),
      );
    }

    return Result.ok();
  }
}
