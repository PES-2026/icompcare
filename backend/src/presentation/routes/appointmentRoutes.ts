import { NextFunction, Request, Response, Router } from "express";

import { AppointmentByIdDTO } from "@application/dtos/appointment/appointmentById";
import { CancelAppointmentPedagogueDTO } from "@application/dtos/appointment/cancelAppointmentPedagogue";
import { ListAppointmentsByPedagogueDTO } from "@application/dtos/appointment/listAppointmentsByPedagogue";
import { RequestAppointmentDTO } from "@application/dtos/appointment/requestAppointment";
import { RescheduleAppointmentPedagogueDTO } from "@application/dtos/appointment/rescheduleAppointmentPedagogue";
import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { AppointmentController } from "@presentation/controllers/appointmentController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { apiRateLimiter, scheduleRateLimiter } from "@presentation/middlewares/rateLimiter";
import { requireRole } from "@presentation/middlewares/role";
import { validateBody } from "@presentation/middlewares/validateBody";
import { validateParamsAndBody } from "@presentation/middlewares/validateParamsAndBody";
import { validateParamsAndQuery } from "@presentation/middlewares/validateParamsAndQuery";

export const appointmentRoutes = (controller: AppointmentController, tokenService: ITokenService) => {
  const routes = Router();

  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  routes.post("/appointments/request", scheduleRateLimiter, validateBody(RequestAppointmentDTO), controller.request);
  routes.get(
    "/appointments/:id",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndQuery(AppointmentByIdDTO),
    controller.getById,
  );
  routes.get(
    "/appointments/pedagogue/:id",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndQuery(ListAppointmentsByPedagogueDTO),
    controller.listByPedagogue,
  );
  routes.post("/appointments/:id/confirm/:type", apiRateLimiter, auth, requireRole([RoleEnum.PEDAGOGUE]), controller.confirm);
  routes.put(
    "/appointments/:id/cancel",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndBody(CancelAppointmentPedagogueDTO),
    controller.cancelPedagogue,
  );
  routes.put(
    "/appointments/:id/reschedule",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndBody(RescheduleAppointmentPedagogueDTO),
    controller.reschedulePedagogue,
  );
  routes.put("/appointments/student/:token/cancel/:type", scheduleRateLimiter, controller.cancelStudent);
  routes.put("/appointments/student/:token/reschedule", scheduleRateLimiter, controller.rescheduleStudent);
  routes.get("/appointments/student/:token", apiRateLimiter, controller.getByToken);

  return routes;
};
