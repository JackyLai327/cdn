import { type Request, type Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";

export const getHealth = (_req: Request, res: Response) => {
  const data = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
  const response = ApiResponse.success(data, "System is healthy");
  res.status(response.statusCode).json(response);
};
