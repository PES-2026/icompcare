import { NextFunction, Request, Response, Router } from "express";

import { CourseByIdDTO } from "@application/dtos/course/courseByIdDto";
import { CreateCourseDTO } from "@application/dtos/course/createCourseDto";
import { ListCourseDTO } from "@application/dtos/course/listCourseDto";
import { RemoveCourseDTO } from "@application/dtos/course/removeCourseDto";
import { UpdateCourseDTO } from "@application/dtos/course/updateCourseDto";
import { RoleEnum } from "@domain/enum/role";
import { ITokenService } from "@domain/services/tokenService";
import { CourseController } from "@presentation/controllers/courseController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { requireRole } from "@presentation/middlewares/role";
import { validateBody } from "@presentation/middlewares/validateBody";
import { validateParams } from "@presentation/middlewares/validateParams";
import { validateParamsAndBody } from "@presentation/middlewares/validateParamsAndBody";
import { validateQuery } from "@presentation/middlewares/validateQuery";

export function courseRoutes(controller: CourseController, tokenService: ITokenService): Router {
  const router = Router();
  const auth = (req: Request, res: Response, next: NextFunction) => authMiddleware(tokenService, req, res, next);

  router.post("/courses", auth, requireRole([RoleEnum.PEDAGOGUE]), validateBody(CreateCourseDTO), controller.create);
  router.put(
    "/courses/:id",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParamsAndBody(UpdateCourseDTO),
    controller.update,
  );
  router.get("/courses", validateQuery(ListCourseDTO), controller.list);
  router.get(
    "/courses/:id",
    auth,
    requireRole([RoleEnum.PEDAGOGUE, RoleEnum.PROFESSOR]),
    validateParams(CourseByIdDTO),
    controller.findById,
  );
  router.post(
    "/courses/:id/remove",
    auth,
    requireRole([RoleEnum.PEDAGOGUE]),
    validateParams(RemoveCourseDTO),
    controller.remove,
  );

  return router;
}
