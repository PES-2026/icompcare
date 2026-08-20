"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { scheduleService } from "@/features/scheduling/services/schedulingService";
import { RequestSchedulePayload } from "@/features/scheduling/types/scheduling";

import {
  AppointmentFormData,
  appointmentSchema,
} from "../schemas/appointmentSchema";
import { TimeSlot } from "../types/appointment";

export const useAppointmentForm = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const methods = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      studentName: "",
      email: "",
      registrationNumber: "",
      pedagogueId: "",
      date: new Date(),
      courseId: "",
      slotId: "",
      durationMinutes: 60,
      reason: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = methods;

  const date = watch("date");
  const pedagogueId = watch("pedagogueId");
  const selectedSlotId = watch("slotId");

  useEffect(() => {
    const fetchSlots = async () => {
      if (!date || !pedagogueId) {
        setSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const data = await scheduleService.getAvailability(pedagogueId, date);
        setSlots(data.items);
      } catch (error) {
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [date, pedagogueId]);

  const handleSelectSlot = (id: string) => {
    const isDeselecting = selectedSlotId === id;
    setValue("slotId", isDeselecting ? "" : id, {
      shouldValidate: true,
    });

    if (!isDeselecting) {
      const slot = slots.find((s) => s.id === id);
      if (slot) {
        setValue("durationMinutes", slot.attendanceTime);
      }
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const payload: RequestSchedulePayload = {
        name: data.studentName,
        email: data.email,
        enrollment: data.registrationNumber,
        pedagogueId: data.pedagogueId,
        courseId: data.courseId,
        availabilitySlotId: data.slotId,
        durationMinutes: data.durationMinutes,
        reason: data.reason,
      };

      await scheduleService.request(payload);

      toast.success("Atendimento solicitado com sucesso!");
      reset({
        studentName: "",
        email: "",
        registrationNumber: "",
        pedagogueId: "",
        date: new Date(),
        courseId: "",
        slotId: "",
        durationMinutes: 60,
        reason: "",
      });
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível solicitar o agendamento.";
      toast.error(message);
      return false;
    }
  };

  return {
    register,
    control,
    trigger,
    handleSubmit: handleSubmit(onSubmit),
    reset,
    errors,
    slots,
    isLoadingSlots,
    isSubmitting,
    selectedSlotId,
    handleSelectSlot,
  };
};
