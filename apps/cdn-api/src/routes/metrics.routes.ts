import express from "express";
import { register } from "../services/metrics.js";
import { type Request, type Response } from "express";

const router = express.Router()

// GET /metrics
router.get("/", async (req: Request, res: Response) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

export default router;
