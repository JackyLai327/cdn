import { httpDuration, httpRequestsTotal } from "../services/metrics.js";
import { type NextFunction, type Request, type Response } from "express";

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime()

  res.on("finish", () => {
    const duration = process.hrtime(start)
    const seconds = duration[0] + duration[1] / 1e9

    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString(),
    }

    // * Record Duration
    httpDuration.observe(labels, seconds)

    // * Record Request Count
    httpRequestsTotal.inc(labels)
  })

  next()
}
