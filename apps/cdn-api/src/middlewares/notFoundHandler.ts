import { ApiResponse } from "../utils/apiResponse.js";
import { type Request, type Response } from "express";

export const notFoundHandler = (_req: Request, res: Response) => {
  const response = ApiResponse.error("Resource not found", 404);
  res.status(404).json(response);
}
