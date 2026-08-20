import api from "@/services/api";
import {
  ListScheduleFilters,
  ManagedSchedulingActionResult,
  PaginatedScheduleResponse,
  ScheduleStatusEnum,
} from "../types/schedulingManagement";

export const scheduleManagementService = {
  async list(
    userId: string,
    page: number,
    limit: number,
    filters?: ListScheduleFilters,
  ): Promise<PaginatedScheduleResponse> {
    const response = await api.get<PaginatedScheduleResponse>(
      `/appointments/pedagogue/${userId}`,
      {
        params: {
          page,
          limit,
          ...filters,
        },
        fallbackMsg: "Não foi possível carregar os agendamentos.",
      },
    );

    return response.data;
  },

  async listPending(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedScheduleResponse> {
    const response = await api.get<PaginatedScheduleResponse>(
      `/appointments/pedagogue/${userId}`,
      {
        params: {
          page,
          limit,
          status: ScheduleStatusEnum.PENDING,
        },
        fallbackMsg: "Não foi possível carregar as solicitações pendentes.",
      },
    );

    return response.data;
  },

  async confirm(
    scheduleId: string,
    type: string,
  ): Promise<ManagedSchedulingActionResult> {
    const response = await api.post<ManagedSchedulingActionResult>(
      `/appointments/${scheduleId}/confirm/${type}`,
      undefined,
      {
        fallbackMsg: "Não foi possível confirmar o atendimento.",
      },
    );

    return response.data;
  },

  async reject(
    scheduleId: string,
    justification: string,
    type: string,
  ): Promise<ManagedSchedulingActionResult> {
    const response = await api.put<ManagedSchedulingActionResult>(
      `/appointments/${scheduleId}/cancel`,
      { reason: justification, type },
      {
        fallbackMsg: "Não foi possível recusar o atendimento.",
      },
    );

    return response.data;
  },

  async cancel(
    scheduleId: string,
    justification: string,
    type: string,
  ): Promise<ManagedSchedulingActionResult> {
    const response = await api.put<ManagedSchedulingActionResult>(
      `/appointments/${scheduleId}/cancel`,
      { reason: justification, type },
      {
        fallbackMsg: "Não foi possível cancelar o agendamento.",
      },
    );

    return response.data;
  },

  async finish(scheduleId: string): Promise<ManagedSchedulingActionResult> {
    const response = await api.patch<ManagedSchedulingActionResult>(
      `/schedulings/appointments/${scheduleId}/finish`,
      undefined,
      {
        fallbackMsg: "Não foi possível finalizar o atendimento.",
      },
    );

    return response.data;
  },
};
