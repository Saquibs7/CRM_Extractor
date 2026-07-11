import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", error);

  const status = (error as any).status || 500;
  const message = error.message || "Internal server error";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
