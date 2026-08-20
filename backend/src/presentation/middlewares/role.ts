import { NextFunction, Request, Response } from "express";

import { RoleEnum } from "@domain/enum/role";

export const requireRole = (allowedRoles: RoleEnum[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.userRole as RoleEnum | undefined;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "User does not have the required permissions.",
      });
    }

    next();
  };
};
