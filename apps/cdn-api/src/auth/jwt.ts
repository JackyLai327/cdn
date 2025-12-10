import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";

export interface AuthClaims {
  sub: string; // user id
  email: string;
}

export const signAuthToken = (claims: AuthClaims) => {
  return jwt.sign(claims, config.JWT_SECRET, {
    expiresIn: "1h",
  });
}

export const verifyAuthToken = (token: string) => {
  return jwt.verify(token, config.JWT_SECRET) as AuthClaims;
}
