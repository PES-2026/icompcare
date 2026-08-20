import { NextFunction, Request, Response, Router } from "express";

import { CreateStudentDTO } from "@application/dtos/student/createStudentDto";
import { ListStudentDTO } from "@application/dtos/student/listStudentsDto";
import { RemoveStudentDTO } from "@application/dtos/student/removeStudentDto";
import { StudentByIdDTO } from "@application/dtos/student/studentByIdDto";
import { UpdateStudentDTO } from "@application/dtos/student/updateStudentDto";
import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { StudentController } from "@presentation/controllers/studentController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { apiRateLimiter } from "@presentation/middlewares/rateLimiter";
import { requireRole } from "@presentation/middlewares/role";
import { validateBody } from "@presentation/middlewares/validateBody";
import { validateParams } from "@presentation/middlewares/validateParams";
import { validateParamsAndBody } from "@presentation/middlewares/validateParamsAndBody";
import { validateQuery } from "@presentation/middlewares/validateQuery";

export function studentRoutes(controller: StudentController, tokenService: ITokenService): Router {
  const router = Router();
  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  router.post(
    "/students",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateBody(CreateStudentDTO),
    controller.create,
  );
  router.get(
    "/students",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateQuery(ListStudentDTO),
    controller.list,
  );
  router.get(
    "/students/:id",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateParams(StudentByIdDTO),
    controller.getById,
  );
  router.put(
    "/students/:id",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndBody(UpdateStudentDTO),
    controller.update,
  );
  router.post(
    "/students/:id/remove",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParams(RemoveStudentDTO),
    controller.remove,
  );

  return router;
}
