import { NextFunction, Request, Response, Router } from "express";

import { AttendanceTypeByIdDTO } from "@application/dtos/attendanceType/attendanceTypeByIdDto";
import { CreateAttendanceTypeDTO } from "@application/dtos/attendanceType/createAttendanceTypeDto";
import { ListAttendanceTypeDTO } from "@application/dtos/attendanceType/listAttendanceTypeDto";
import { RemoveAttendanceTypeDTO } from "@application/dtos/attendanceType/removeAttendanceTypeDto";
import { UpdateAttendanceTypeDTO } from "@application/dtos/attendanceType/updateAttendanceTypeDto";
import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { AttendanceTypeController } from "@presentation/controllers/attendanceTypeController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { requireRole } from "@presentation/middlewares/role";
import { validateBody } from "@presentation/middlewares/validateBody";
import { validateParams } from "@presentation/middlewares/validateParams";
import { validateParamsAndBody } from "@presentation/middlewares/validateParamsAndBody";
import { validateQuery } from "@presentation/middlewares/validateQuery";

export function attendanceTypeRoutes(controller: AttendanceTypeController, tokenService: ITokenService): Router {
  const router = Router();
  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  router.post(
    "/attendance-types",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateBody(CreateAttendanceTypeDTO),
    controller.create,
  );
  router.put(
    "/attendance-types/:id",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndBody(UpdateAttendanceTypeDTO),
    controller.update,
  );
  router.get(
    "/attendance-types",
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateQuery(ListAttendanceTypeDTO),
    controller.list,
  );
  router.post(
    "/attendance-types/:id/remove",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParams(RemoveAttendanceTypeDTO),
    controller.remove,
  );
  router.get(
    "/attendance-types/:id",
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateParams(AttendanceTypeByIdDTO),
    controller.getById,
  );

  return router;
}
