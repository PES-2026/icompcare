import { NextFunction, Request, Response, Router } from "express";

import { AttendanceByIdDTO } from "@application/dtos/attendance/attendanceByIdDto";
import { AttendancesByStudentDTO } from "@application/dtos/attendance/attendancesByStudentDto";
import { CreateAttendanceDTO } from "@application/dtos/attendance/createAttendanceDto";
import { ListAttendanceDTO } from "@application/dtos/attendance/listAttendanceDto";
import { RemoveAttendanceDTO } from "@application/dtos/attendance/removeAttendanceDto";
import { UpdateAttendanceDTO } from "@application/dtos/attendance/updateAttendanceDto";
import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { AttendanceController } from "@presentation/controllers/attendanceController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { requireRole } from "@presentation/middlewares/role";
import { validateBody } from "@presentation/middlewares/validateBody";
import { validateParams } from "@presentation/middlewares/validateParams";
import { validateParamsAndBody } from "@presentation/middlewares/validateParamsAndBody";
import { validateParamsAndQuery } from "@presentation/middlewares/validateParamsAndQuery";
import { validateQuery } from "@presentation/middlewares/validateQuery";

export function attendanceRoutes(controller: AttendanceController, tokenService: ITokenService): Router {
  const router = Router();
  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  router.post(
    "/attendances",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateBody(CreateAttendanceDTO),
    controller.create,
  );
  router.get(
    "/attendances",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateQuery(ListAttendanceDTO),
    controller.list,
  );
  router.put(
    "/attendances/:id",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndBody(UpdateAttendanceDTO),
    controller.update,
  );
  router.get(
    "/attendances/student/:id",
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateParamsAndQuery(AttendancesByStudentDTO),
    controller.listByStudent,
  );
  router.post(
    "/attendances/:id/remove",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParams(RemoveAttendanceDTO),
    controller.remove,
  );
  router.get(
    "/attendances/:id",
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateParams(AttendanceByIdDTO),
    controller.getById,
  );

  return router;
}
