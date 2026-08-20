import { NextFunction, Request, Response, Router } from "express";

import { CreateDiagnosisDTO } from "@application/dtos/diagnoses/createDiagnosisDto";
import { DiagnosisByIdDTO } from "@application/dtos/diagnoses/diagnosisByIdDto";
import { ListDiagnosisDTO } from "@application/dtos/diagnoses/listDiagnosisDto";
import { RemoveDiagnosisDTO } from "@application/dtos/diagnoses/removeDiagnosisDto";
import { UpdateDiagnosisDTO } from "@application/dtos/diagnoses/updateDiagnosisDto";
import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { DiagnosesController } from "@presentation/controllers/diagnosesController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { apiRateLimiter } from "@presentation/middlewares/rateLimiter";
import { requireRole } from "@presentation/middlewares/role";
import { validateBody } from "@presentation/middlewares/validateBody";
import { validateParams } from "@presentation/middlewares/validateParams";
import { validateParamsAndBody } from "@presentation/middlewares/validateParamsAndBody";
import { validateQuery } from "@presentation/middlewares/validateQuery";

export function diagnosesRoutes(controller: DiagnosesController, tokenService: ITokenService): Router {
  const router = Router();
  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  router.post(
    "/diagnoses",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateBody(CreateDiagnosisDTO),
    controller.create,
  );
  router.put(
    "/diagnoses/:id",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndBody(UpdateDiagnosisDTO),
    controller.update,
  );
  router.get(
    "/diagnoses",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateQuery(ListDiagnosisDTO),
    controller.list,
  );
  router.post(
    "/diagnoses/:id/remove",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParams(RemoveDiagnosisDTO),
    controller.remove,
  );
  router.get(
    "/diagnoses/:id",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateParams(DiagnosisByIdDTO),
    controller.getById,
  );

  return router;
}
