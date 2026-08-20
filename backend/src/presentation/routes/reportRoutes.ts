import { NextFunction, Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";

import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { ReportController } from "@presentation/controllers/reportController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { requireRole } from "@presentation/middlewares/role";

export function reportRoutes(controller: ReportController, tokenService: ITokenService): Router {
  const router = Router();
  const reportRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  router.post("/reports", reportRateLimiter, auth, requireRole([RoleEnum.PEDAGOGUE]), controller.create);
  router.get(
    "/reports/:reportId",
    reportRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    controller.getById,
  );
  router.get(
    "/reports/student/:studentId",
    reportRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    controller.listByStudent,
  );
  router.put("/reports/:reportId", reportRateLimiter, auth, requireRole([RoleEnum.PEDAGOGUE]), controller.edit);
  router.delete("/reports/:reportId", reportRateLimiter, auth, requireRole([RoleEnum.PEDAGOGUE]), controller.remove);

  return router;
}
