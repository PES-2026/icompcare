import { NextFunction, Request, Response } from "express";
import { env } from "@infrastructure/config/env";

const allowedOrigins = [
  `https://${env.FRONTEND_HOST}`,
  `http://${env.FRONTEND_HOST}`,
  `http://${env.FRONTEND_HOST}:${env.FRONTEND_PORT}`,
];

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  if (!req.cookies?.accessToken) {
    return next();
  }

  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
  if (origin && allowedOrigins.includes(origin)) {
    return next();
  }

  if (req.headers["x-requested-with"] === "XMLHttpRequest") {
    return next();
  }

  res.status(403).json({ error: "Forbidden", message: "CSRF check failed." });
}
