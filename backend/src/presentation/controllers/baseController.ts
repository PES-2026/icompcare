import { Response } from "express";

import { ApplicationError } from "@application/errors/applicationError";
import { DomainError } from "@domain/errors/domainError";
import { Result } from "@domain/shared/result";

import { HttpErrorMapper } from "../mappers/httpErrorMapper";

export abstract class BaseController {
  public ok<T>(res: Response, dto?: T): void {
    if (dto) {
      res.status(200).json(dto);
    } else {
      res.sendStatus(200);
    }
  }

  public created<T>(res: Response, dto?: T): void {
    if (dto) {
      res.status(201).json(dto);
    } else {
      res.sendStatus(201);
    }
  }

  public clientError(res: Response, message?: string): void {
    res.status(400).json({ error: "BadRequest", message: message || "Bad request" });
  }

  public notFound(res: Response, message?: string): void {
    res.status(404).json({ error: "NotFound", message: message || "Not found" });
  }

  public handleError(error: unknown, res: Response, context?: string): void {
    const errorType = error instanceof Error ? error.name : "UnknownError";
    console.error(`[${context || "BaseController"}] Unhandled Exception: ${errorType}`);
    res.status(500).json({ error: "InternalServerError", message: "Internal server error" });
  }

  public handleResult<T>(
    res: Response,
    result: Result<T, DomainError | ApplicationError>,
    successStatusCode: 200 | 201 | 204 = 200,
  ): void {
    if (result.isSuccess) {
      if (successStatusCode === 201) {
        this.created(res, result.getValue());
      } else {
        this.ok(res, result.getValue());
      }
      return;
    }

    const error = result.error;
    if (error instanceof DomainError) {
      const { statusCode, body } = HttpErrorMapper.toResponse(error);
      res.status(statusCode).json(body);
    } else {
      const err = error as unknown;
      const errorType = err instanceof Error ? err.name : "ApplicationError";
      console.error(`[BaseController:handleResult] Unmapped Result Error: ${errorType}`);
      res.status(500).json({ error: "InternalServerError", message: "Internal server error" });
    }
  }
}
