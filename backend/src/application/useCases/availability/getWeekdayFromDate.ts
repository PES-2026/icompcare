import { DaysOfWeekEnum } from "@domain/enum/daysOfWeek";

export class GetWeekdayFromDate {
  execute(date: Date): DaysOfWeekEnum {
    const parsedDate = new Date(date);
    const weekdayMap: Record<number, DaysOfWeekEnum> = {
      0: DaysOfWeekEnum.SUNDAY,
      1: DaysOfWeekEnum.MONDAY,
      2: DaysOfWeekEnum.TUESDAY,
      3: DaysOfWeekEnum.WEDNESDAY,
      4: DaysOfWeekEnum.THURSDAY,
      5: DaysOfWeekEnum.FRIDAY,
      6: DaysOfWeekEnum.SATURDAY,
    };

    return weekdayMap[parsedDate.getUTCDay()]!;
  }
}
