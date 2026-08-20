import { NextFunction, Request, Response, Router } from "express";

import { CreateAvailabilityDTO } from "@application/dtos/availability/createAvailability";
import { ListAvailabilitiesByPedagogueDTO } from "@application/dtos/availability/listAvailabilitiesByPedagogue";
import { PreviewAvailabilityDTO } from "@application/dtos/availability/previewAvailability";
import { RemoveAvailabilityDTO } from "@application/dtos/availability/removeAvailability";
import { RemoveManyAvailabilitiesDTO } from "@application/dtos/availability/removeManyAvailabilities";
import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { AvailabilityController } from "@presentation/controllers/availabilityController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { apiRateLimiter } from "@presentation/middlewares/rateLimiter";
import { requireRole } from "@presentation/middlewares/role";
import { validateBody } from "@presentation/middlewares/validateBody";
import { validateParams } from "@presentation/middlewares/validateParams";
import { validateParamsAndQuery } from "@presentation/middlewares/validateParamsAndQuery";

export const availabilityRoutes = (controller: AvailabilityController, tokenService: ITokenService) => {
  const routes = Router();
  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  routes.post(
    "/availabilities/preview",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateBody(PreviewAvailabilityDTO),
    controller.preview,
  );
  routes.post(
    "/availabilities",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateBody(CreateAvailabilityDTO),
    controller.create,
  );
  routes.get(
    "/availabilities/pedagogue/:id",
    apiRateLimiter,
    validateParamsAndQuery(ListAvailabilitiesByPedagogueDTO),
    controller.list,
  );
  routes.put(
    "/availabilities/:id/remove",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParams(RemoveAvailabilityDTO),
    controller.remove,
  );
  routes.put(
    "/availabilities/remove-many",
    apiRateLimiter,
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateBody(RemoveManyAvailabilitiesDTO),
    controller.removeMany,
  );

  return routes;
};
