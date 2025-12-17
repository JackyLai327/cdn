import { logger } from "../../lib/logger.js";
import { verifyAuthToken } from "../auth/jwt.js";
import { type Request, type Response, type NextFunction } from "express";
import { AuthRequest } from "../types/authRequest.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.slice("Bearer ".length);
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    const authClaims = verifyAuthToken(token);
    (req as AuthRequest).auth = authClaims;
    return next();
  } catch (error) {
    logger.error(error);
    return res.status(401).json({ error: "Invalid token" });
  }
};
