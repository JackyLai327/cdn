import { verifyAuthToken, type AuthClaims } from "../auth/jwt.js";
import { type Request, type Response, type NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthClaims;
    }
  }
}

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
    req.auth = authClaims;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
