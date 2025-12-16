import { Request } from "express";
import { AuthClaims } from "../auth/jwt.js";

export type AuthRequest = Request & {
  auth: AuthClaims;
  headers: {
    authorization: string;
  };
};
