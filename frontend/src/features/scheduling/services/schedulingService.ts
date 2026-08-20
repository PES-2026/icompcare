import {
  TimeSlot,
  TimeSlotResponse,
} from "@/features/appointments/types/appointment";
import api from "@/services/api";
import {
  RequestSchedulePayload,
  SchedulingPreviewPayload,
  SchedulingPreviewResponse,
  SchedulingSavePayload,
} from "../types/scheduling";
import { formatDateInput } from "../utils/schedulingDates";

export const scheduleService = {
  async preview(
    payload: SchedulingPreviewPayload,
  ): Promise<SchedulingPreviewResponse> {
    const response = await api.post<SchedulingPreviewResponse>(
      "/availabilities/preview",
      payload,
      {
        fallbackMsg: "Não foi possível gerar a prévia da agenda.",
      },
    );

    return response.data;
  },

  async save(payload: SchedulingSavePayload): Promise<void> {
    await api.post("/availabilities", payload, {
      fallbackMsg: "Não foi possível salvar a agenda.",
    });
  },

  async removeSlots(ids: string[]): Promise<void> {
    await api.put("/availabilities/remove-many", ids, {
      fallbackMsg: "Não foi possível remover os horários.",
    });
  },

  async request(payload: RequestSchedulePayload): Promise<void> {
    await api.post("/appointments/request", payload, {
      fallbackMsg: "Não foi possível solicitar o atendimento.",
    });
  },

  async getAvailableSlots(
    date: string,
    pedagogueId: string,
  ): Promise<TimeSlot[]> {
    const response = await api.get<TimeSlot[]>(
      `/availabilities/pedagogue/${pedagogueId}`,
      {
        params: { startDate: date, endDate: date },
        fallbackMsg: "Não foi possível carregar os horários disponíveis.",
      },
    );

    return response.data;
  },

  async getAvailability(
    pedagogueId: string,
    date: Date,
    page: number = 1,
    limit: number = 100,
  ): Promise<TimeSlotResponse> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const response = await api.get<TimeSlotResponse>(
      `/availabilities/pedagogue/${pedagogueId}`,
      {
        params: {
          page,
          limit,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          status: "CREATED",
        },
        fallbackMsg: "Não foi possível carregar os horários disponíveis.",
      },
    );

    return response.data;
  },

  async getAllAvailabilities(
    pedagogueId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<TimeSlotResponse> {
    const response = await api.get<TimeSlotResponse>(
      `/availabilities/pedagogue/${pedagogueId}`,
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 100,
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
          ...(params?.status && { status: params.status }),
        },
        fallbackMsg: "Não foi possível carregar os horários da agenda.",
      },
    );

    return response.data;
  },

  async getAppointmentByToken(token: string): Promise<Record<string, unknown>> {
    const response = await api.get<Record<string, unknown>>(`/appointments/student/${token}`, {
      fallbackMsg: "Não foi possível carregar os detalhes do agendamento.",
    });
    return response.data;
  },

  async rescheduleStudent(
    token: string,
    payload: { newSlotId: string; type: string; reason?: string },
  ): Promise<void> {
    await api.put(`/appointments/student/${token}/reschedule`, payload, {
      fallbackMsg: "Não foi possível reagendar o atendimento.",
    });
  },

  async cancelStudent(token: string, type: string): Promise<void> {
    await api.put(
      `/appointments/student/${token}/cancel/${type}`,
      {},
      {
        fallbackMsg: "Não foi possível cancelar o atendimento.",
      },
    );
  },
};
