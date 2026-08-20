import { Router } from "express";

import { ITokenService } from "@domain/services/tokenService";
import { AuthController } from "@presentation/controllers/authController";
import { authMiddleware } from "@presentation/middlewares/auth";
import { apiRateLimiter, authRateLimiter } from "@presentation/middlewares/rateLimiter";

export const authRoutes = (authController: AuthController, jwtService: ITokenService) => {
  const routes = Router();

  routes.post("/auth/login", authRateLimiter, authController.login);
  routes.get("/auth/me", apiRateLimiter, (req, res, next) => authMiddleware(jwtService, req, res, next), authController.me);
  routes.post("/auth/logout", authRateLimiter, authController.logout);
  routes.post("/auth/forgot-password", authRateLimiter, authController.forgotPassword);
  routes.post("/auth/reset-password", authRateLimiter, authController.resetPassword);

  return routes;
};
