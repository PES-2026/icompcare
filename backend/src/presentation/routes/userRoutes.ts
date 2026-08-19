import { NextFunction, Request, Response, Router } from "express";

import { ActivateUserDTO } from "@application/dtos/user/activateUserDto";
import { ListUsersDTO } from "@application/dtos/user/listUsersDto";
import { RemoveUserDTO } from "@application/dtos/user/removeUserDto";
import { UpdateUserDTO } from "@application/dtos/user/updateUserDto";
import { UpdateUserPasswordDTO } from "@application/dtos/user/updateUserPasswordDto";
import { UserByIdDTO } from "@application/dtos/user/userByIdDto";
import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { UserController } from "@presentation/controllers/userController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { authRateLimiter } from "@presentation/middlewares/rateLimiter";
import { requireRole } from "@presentation/middlewares/role";
import { validateParams } from "@presentation/middlewares/validateParams";
import { validateParamsAndBody } from "@presentation/middlewares/validateParamsAndBody";
import { validateQuery } from "@presentation/middlewares/validateQuery";

export function userRoutes(controller: UserController, tokenService: ITokenService): Router {
  const router = Router();
  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  router.get("/users", validateQuery(ListUsersDTO), controller.list);
  router.put(
    "/users/:id",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndBody(UpdateUserDTO),
    controller.update,
  );
  router.put(
    "/users/:id/password",
    authRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndBody(UpdateUserPasswordDTO),
    controller.updatePassword,
  );
  router.get(
    "/users/:id",
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateParams(UserByIdDTO),
    controller.getById,
  );
  router.post(
    "/users/:id/remove",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParams(RemoveUserDTO),
    controller.remove,
  );
  router.post(
    "/users/:id/activate",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParams(ActivateUserDTO),
    controller.activate,
  );

  return router;
}
