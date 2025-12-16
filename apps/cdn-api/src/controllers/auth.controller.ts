import { signAuthToken } from "../auth/jwt.js";
import { BadRequestError } from "../../lib/errors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { devAuthSchema } from "./schemas/auth.schema.js";
import { type NextFunction, type Request, type Response } from "express";

export const devAuthLoginController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = devAuthSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new BadRequestError(
      "Invalid input: " + JSON.stringify(parsed.error.format())
    );
  }

  const { userId, email } = parsed.data;

  const token = signAuthToken({ sub: userId, email });

  const response = ApiResponse.success(token, "Login successful");

  return res
    .status(response.statusCode)
    .json({ data: response.data, message: response.message });
};
