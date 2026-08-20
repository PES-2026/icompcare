import { NextFunction, Request, Response, Router } from "express";

import { ApproveUserDTO } from "@application/dtos/accountRequest/approveUserDto";
import { CreateProfessorDTO } from "@application/dtos/professor/createProfessor";
import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { AccountRequestController } from "@presentation/controllers/accountRequestController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { apiRateLimiter, createAccountRateLimiter } from "@presentation/middlewares/rateLimiter";
import { requireRole } from "@presentation/middlewares/role";
import { validateBody } from "@presentation/middlewares/validateBody";

export function accountRequestRoutes(controller: AccountRequestController, tokenService: ITokenService): Router {
  const router = Router();
  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  router.post("/account-requests", createAccountRateLimiter, validateBody(CreateProfessorDTO), controller.create);
  router.get("/account-requests/pending", apiRateLimiter, auth, requireRole([RoleEnum.PEDAGOGUE]), controller.listPending);
  router.post(
    "/account-requests/approve-users",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateBody(ApproveUserDTO),
    controller.approve,
  );

  return router;
}
