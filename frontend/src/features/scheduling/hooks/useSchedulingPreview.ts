"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useAuthStore } from "@/store/authStore";
import { scheduleService } from "../services/schedulingService";
import {
  SchedulingDayPreview,
  SchedulingFormData,
  SchedulingPreviewPayload,
  SchedulingSavePayload,
  SchedulingSlot,
} from "../types/scheduling";
import {
  generateSchedulingPreview,
  minutesToTime,
} from "../utils/schedulingPreview";
import { scheduleSchema } from "../utils/validations";

export const SCHEDULING_PREVIEW_MOCK_ENABLED =
  process.env.NEXT_PUBLIC_SCHEDULING_PREVIEW_MOCK === "true";

const getSlotId = (slot: SchedulingSlot & { dayDate?: Date }) => {
  if (slot.startDateTime && slot.endDateTime) {
    return `${slot.startDateTime}|${slot.endDateTime}`;
  }
  return `${slot.dayDate}|${slot.start}|${slot.end}`;
};

export const useSchedulingPreview = () => {
  const pedagogueId = useAuthStore((state) => state.user?.id);
  const [days, setDays] = useState<SchedulingDayPreview[]>([]);
  const [disabledSlotIds, setDisabledSlotIds] = useState<Set<string>>(
    new Set(),
  );
  const [previewPayload, setPreviewPayload] =
    useState<SchedulingPreviewPayload | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);

  const form = useForm<SchedulingFormData>({
    resolver: zodResolver(scheduleSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      durationMinutes: "50",
      breakTime: "10",
    },
  });

  const parseLocalTimeToDate = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return new Date(1970, 0, 1, hours, minutes, 0, 0);
  };

  const parseLocalDate = (dateStr: string, isEnd = false) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (isEnd) {
      return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  const generatePreview = async (data: SchedulingFormData) => {
    if (!pedagogueId) {
      toast.error("Não foi possível identificar a pedagoga.");
      return;
    }

    const payload: SchedulingPreviewPayload = {
      pedagogueId,
      startDate: parseLocalDate(data.startDate),
      endDate: parseLocalDate(data.endDate, true),
      startHour: parseLocalTimeToDate(data.startTime),
      endHour: parseLocalTimeToDate(data.endTime),
      attendanceTime: Number(data.durationMinutes),
      breakTime: Number(data.breakTime),
    };

    try {
      setIsLoading(true);

      const response = SCHEDULING_PREVIEW_MOCK_ENABLED
        ? generateSchedulingPreview(payload)
        : await scheduleService.preview(payload);

      setDays(response);
      setDisabledSlotIds(new Set());
      setPreviewPayload(payload);
      setHasGeneratedPreview(true);

      if (response.length === 0) {
        toast.error("Nenhum horário completo cabe no período informado.");
      } else {
        toast.success("Prévia da agenda gerada com sucesso.");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a prévia da agenda.";

      toast.error(message);
      setDays([]);
      setDisabledSlotIds(new Set());
      setPreviewPayload(null);
      setHasGeneratedPreview(false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearPreview = () => {
    form.reset();
    setDays([]);
    setDisabledSlotIds(new Set());
    setPreviewPayload(null);
    setIsConfirmOpen(false);
    setHasGeneratedPreview(false);
  };

  const invalidatePreview = () => {
    if (!hasGeneratedPreview) return;

    setDays([]);
    setDisabledSlotIds(new Set());
    setPreviewPayload(null);
    setIsConfirmOpen(false);
    setHasGeneratedPreview(false);
  };

  const toggleSlot = (slotId: string) => {
    setDisabledSlotIds((current) => {
      const next = new Set(current);

      if (next.has(slotId)) {
        next.delete(slotId);
      } else {
        next.add(slotId);
      }

      return next;
    });
  };

  const getAllSlots = () =>
    days.flatMap((day) =>
      day.slots.map((slot) => ({ ...slot, dayDate: day.date })),
    );

  const toggleAllDaySlots = (daySlotIds: string[], isEnablingAll: boolean) => {
    setDisabledSlotIds((current) => {
      const next = new Set(current);
      const allSlots = getAllSlots();

      daySlotIds.forEach((slotId) => {
        const slot = allSlots.find((s) => getSlotId(s) === slotId);

        if (!slot) return;

        if (isEnablingAll) {
          if (slot.status === "AVAILABLE") {
            next.add(slotId);
          } else if (slot.status === "CREATED") {
            next.delete(slotId);
          }
        } else {
          if (slot.status === "AVAILABLE") {
            next.delete(slotId);
          } else if (slot.status === "CREATED") {
            next.add(slotId);
          }
        }
      });

      return next;
    });
  };

  const isSlotGreen = (slot: SchedulingSlot, dayDate: Date) => {
    const slotId = getSlotId({ ...slot, dayDate });
    const isToggled = disabledSlotIds.has(slotId);

    if (slot.status === "AVAILABLE") {
      return isToggled;
    }
    return !isToggled;
  };

  const getActiveSlots = () => {
    const activeSlots: (SchedulingSlot & {
      dayDate: Date;
      weekday: string;
    })[] = [];

    days.forEach((day) => {
      day.slots.forEach((slot) => {
        if (isSlotGreen(slot, day.date)) {
          activeSlots.push({
            ...slot,
            dayDate: day.date,
            weekday: day.weekday,
          });
        }
      });
    });

    return activeSlots;
  };

  const confirmPreview = () => {
    if (!previewPayload) {
      toast.error("Gere a prévia antes de salvar a agenda.");
      return;
    }

    if (!hasChanges) {
      toast.error("Realize alguma alteração para salvar.");
      return;
    }

    setIsConfirmOpen(true);
  };

  const cancelSaveConfirmation = () => {
    if (isSaving) return;

    setIsConfirmOpen(false);
  };

  const saveScheduling = async () => {
    if (!previewPayload || days.length === 0) {
      toast.error("Gere a prévia antes de salvar a agenda.");
      return;
    }

    if (!pedagogueId) {
      toast.error("Não foi possível identificar a pedagoga.");
      return;
    }

    const activeSlots = getActiveSlots();

    const idsToRemove: string[] = [];
    days.forEach((day) => {
      day.slots.forEach((slot) => {
        if (
          slot.status === "CREATED" &&
          slot.id &&
          disabledSlotIds.has(getSlotId({ ...slot, dayDate: day.date }))
        ) {
          idsToRemove.push(slot.id);
        }
      });
    });

    const createPayload: SchedulingSavePayload = activeSlots
      .filter((slot) => slot.status === "AVAILABLE")
      .map((slot) => ({
        date: slot.dayDate,
        weekday: slot.weekday,
        pedagogueId,
        start: slot.start,
        end: slot.end,
        attendanceTime: slot.attendanceTime,
      }));

    if (createPayload.length === 0 && idsToRemove.length === 0) {
      toast.error("Nenhuma alteração detectada para salvar.");
      return;
    }

    try {
      setIsSaving(true);

      const results = await Promise.allSettled([
        createPayload.length > 0
          ? scheduleService.save(createPayload)
          : Promise.resolve(),
        idsToRemove.length > 0
          ? scheduleService.removeSlots(idsToRemove)
          : Promise.resolve(),
      ]);

      const [createResult, removeResult] = results;

      if (createResult.status === "fulfilled" && createPayload.length > 0) {
        toast.success(
          `${createPayload.length} horários criados/mantidos com sucesso.`,
        );
      } else if (
        createResult.status === "rejected" &&
        createPayload.length > 0
      ) {
        toast.error(
          `Falha ao criar horários: ${createResult.reason.message || "Erro desconhecido"}`,
        );
      }

      if (removeResult.status === "fulfilled" && idsToRemove.length > 0) {
        toast.success(`${idsToRemove.length} horários removidos com sucesso.`);
      } else if (removeResult.status === "rejected" && idsToRemove.length > 0) {
        toast.error(
          `Falha ao remover horários: ${removeResult.reason.message || "Erro desconhecido"}`,
        );
      }

      setIsConfirmOpen(false);

      const currentFormData = form.getValues();
      await generatePreview(currentFormData);
    } catch (error: unknown) {
      toast.error("Ocorreu um erro inesperado ao processar a agenda.");
    } finally {
      setIsSaving(false);
    }
  };

  const activeSlotsCount = getActiveSlots().length;

  const getRemovedSlotsCount = () => {
    let count = 0;
    days.forEach((day) => {
      day.slots.forEach((slot) => {
        if (
          slot.status === "CREATED" &&
          slot.id &&
          disabledSlotIds.has(getSlotId({ ...slot, dayDate: day.date }))
        ) {
          count++;
        }
      });
    });
    return count;
  };

  const removedSlotsCount = getRemovedSlotsCount();
  const hasChanges = days.some((day) =>
    day.slots.some((slot) =>
      disabledSlotIds.has(getSlotId({ ...slot, dayDate: day.date })),
    ),
  );

  return {
    form,
    days,
    slots: getAllSlots(),
    previewPayload,
    disabledSlotIds,
    isLoading,
    isSaving,
    isConfirmOpen,
    hasGeneratedPreview,
    activeSlotsCount,
    removedSlotsCount,
    hasChanges,
    isMockMode: SCHEDULING_PREVIEW_MOCK_ENABLED,
    clearPreview,
    invalidatePreview,
    toggleSlot,
    toggleAllDaySlots,
    confirmPreview,
    cancelSaveConfirmation,
    saveScheduling,
    onSubmit: form.handleSubmit(generatePreview),
  };
};
