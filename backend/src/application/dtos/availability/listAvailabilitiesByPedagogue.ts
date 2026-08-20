import { AvailabilityStatusEnum } from "@domain/enum/availabilityStatus";
import { AvailabilityFilters } from "@domain/repositories/filters/availabilityFilters";
import { findValueInEnum } from "@domain/utils/enumUtils";
import {
  validateDateField,
  validateExternalIdField,
  validateNumberField,
  validateStringField,
} from "@domain/utils/validationUtils";

import { validatePageLimitValues } from "../shared/paginationValidationsDto";

export class ListAvailabilitiesByPedagogueDTO {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly filters: AvailabilityFilters,
  ) {}

  static create(pedagogueId: unknown, value: unknown): ListAvailabilitiesByPedagogueDTO {
    if (typeof pedagogueId !== "string" || !pedagogueId.trim()) {
      throw new Error("Pedagogue Id is required and must be a string");
    }

    if (typeof value !== "object" || value === null) {
      throw new Error(`Invalid input to ${ListAvailabilitiesByPedagogueDTO.name}`);
    }

    const raw = value as Record<string, unknown>;

    const page = validateNumberField(raw.page, "page");
    const limit = validateNumberField(raw.limit, "limit");

    const validPedagogueId = validateExternalIdField(raw.pedagogueId ?? pedagogueId, "pedagogueId");

    const filters: AvailabilityFilters = {
      pedagogueId: validPedagogueId,
    };

    if (raw.status) {
      filters.status = findValueInEnum(AvailabilityStatusEnum, validateStringField(raw.status, "status"));
    }
    if (raw.startDate) {
      filters.startDate = validateDateField(raw.startDate, "startDate");
    }
    if (raw.endDate) {
      filters.endDate = validateDateField(raw.endDate, "endDate");
    }
    if (raw.attendanceTime) {
      filters.attendanceTime = validateNumberField(raw.attendanceTime, "attendanceTime");
    }

    validatePageLimitValues(page, limit);

    return new ListAvailabilitiesByPedagogueDTO(page, limit, filters);
  }
}
