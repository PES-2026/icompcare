import {
  Availability,
  PreviewAvailabilityDTO,
  PreviewAvailabilityItemResponse,
} from "@application/dtos/availability/previewAvailability";
import { ApplicationError } from "@application/errors/applicationError";
import { EndHourLowerThanStartHourError } from "@application/errors/appointment/endHourLowerThanStartHourError";
import { AttendanceTimeGreatherThanZeroError } from "@application/errors/availability/attendanceTimeGreatherThanZeroError";
import { AvailabilityPreview } from "@domain/entities/availabilityPreview";
import { AvailabilityPreviewStatus } from "@domain/enum/availabilityStatus";
import { DomainError } from "@domain/errors/domainError";
import { IAvailabilityRepository } from "@domain/repositories/availabilityRepository";
import { AvailabilityResult } from "@domain/repositories/results/availabilityResult";
import { Result } from "@domain/shared/result";

import { GetWeekdayFromDate } from "./getWeekdayFromDate";

export class PreviewAvailability {
  constructor(
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly getWeekdayFromDate: GetWeekdayFromDate,
  ) {}

  async execute(
    dto: PreviewAvailabilityDTO,
  ): Promise<Result<Array<PreviewAvailabilityItemResponse>, ApplicationError | DomainError>> {
    if (dto.attendanceTime <= 0) {
      return Result.fail(new AttendanceTimeGreatherThanZeroError());
    }

    const startHourMinutes = dto.startHour.getUTCHours() * 60 + dto.startHour.getUTCMinutes();
    const endHourMinutes = dto.endHour.getUTCHours() * 60 + dto.endHour.getUTCMinutes();

    if (endHourMinutes < startHourMinutes) {
      return Result.fail(new EndHourLowerThanStartHourError(dto.startHour.getUTCHours(), dto.endHour.getUTCHours()));
    }

    const startRange = new Date(Date.UTC(dto.startDate.getUTCFullYear(), dto.startDate.getUTCMonth(), dto.startDate.getUTCDate(), 0, 0, 0, 0));
    const endRange = new Date(Date.UTC(dto.endDate.getUTCFullYear(), dto.endDate.getUTCMonth(), dto.endDate.getUTCDate(), 23, 59, 59, 999));

    const existingSlots = await this.availabilityRepository.findAllAvailabilitiesByRange(
      dto.pedagogueId,
      startRange,
      endRange,
    );

    const previewItems = this.getAvailabilitySlots(
      dto.pedagogueId,
      dto.startDate,
      dto.endDate,
      dto.attendanceTime,
      dto.breakTime,
      dto.startHour,
      dto.endHour,
      existingSlots,
    );

    if (previewItems.isFailure) {
      return Result.fail(previewItems.error as DomainError);
    }

    return Result.ok(previewItems.getValue());
  }

  private getAvailabilitySlots(
    pedagogueId: string,
    startDate: Date,
    endDate: Date,
    attendanceTime: number,
    breakTime: number,
    startHour: Date,
    endHour: Date,
    existingSlots: AvailabilityResult[],
  ): Result<Array<PreviewAvailabilityItemResponse>> {
    const previewItems: Array<PreviewAvailabilityItemResponse> = [];

    const tempStartDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0));
    const tempEndDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 0, 0, 0, 0));
    const startHourMinutes = startHour.getUTCHours() * 60 + startHour.getUTCMinutes();
    const endHourMinutes = endHour.getUTCHours() * 60 + endHour.getUTCMinutes();

    const currentDate = new Date(tempStartDate);

    while (currentDate <= tempEndDate) {
      const slots: Array<Availability> = [];
      let currentStartMinutes = startHourMinutes;

      while (currentStartMinutes + attendanceTime <= endHourMinutes) {
        const startDateTime = new Date(currentDate);
        startDateTime.setUTCMinutes(startDateTime.getUTCMinutes() + currentStartMinutes);

        const endDateTime = new Date(currentDate);
        endDateTime.setUTCMinutes(endDateTime.getUTCMinutes() + currentStartMinutes + attendanceTime);

        const existingSlot = existingSlots.find((s) => {
          const sStart = s.startDateTime.getTime();
          const sEnd = s.endDateTime.getTime();
          const genStart = startDateTime.getTime();
          const genEnd = endDateTime.getTime();

          const offsetMs = startDateTime.getTimezoneOffset() * 60000;

          const matchExact = sStart === genStart && sEnd === genEnd;
          const matchShiftedGen = sStart === genStart - offsetMs && sEnd === genEnd - offsetMs;
          const matchShiftedDb = sStart - offsetMs === genStart && sEnd - offsetMs === genEnd;

          return matchExact || matchShiftedGen || matchShiftedDb;
        });

        const previewEntityResult = AvailabilityPreview.create({
          id: existingSlot?.id,
          pedagogueId: pedagogueId,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          attendanceTime: attendanceTime,
          status: existingSlot ? existingSlot.status : AvailabilityPreviewStatus.AVAILABLE,
        });

        if (previewEntityResult.isFailure) {
          return Result.fail(previewEntityResult.error!);
        }

        const previewEntity = previewEntityResult.getValue();

        const slotItem: Availability = {
          start: startDateTime,
          end: endDateTime,
          attendanceTime: previewEntity.attendanceTime.value,
          status: previewEntity.status.value,
        };

        if (previewEntity.id?.value) {
          slotItem.id = previewEntity.id.value;
        }

        slots.push(slotItem);

        currentStartMinutes += attendanceTime + breakTime;
      }

      previewItems.push({
        date: new Date(currentDate),
        weekday: this.getWeekdayFromDate.execute(currentDate),
        slots,
      });

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return Result.ok(previewItems);
  }
}
