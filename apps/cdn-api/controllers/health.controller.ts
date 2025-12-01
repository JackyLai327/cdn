import { type Request, type Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";

export const getHealth = (_req: Request, res: Response) => {
    const response = ApiResponse.success({ status: "UP" }, "System is healthy");
    res.status(response.statusCode).json(response);
};
