import { logger } from "../../lib/logger.js";
import { BadRequestError } from "../../lib/errors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { FilesService } from "../services/filesService.js";
import { getJobStatusSchema } from "./schemas/jobs.schema.js";
import { type Request, type Response, type NextFunction } from "express";

export const getJobStatus =
  (filesService: FilesService) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = getJobStatusSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new BadRequestError("Invalid job ID");
      }

      const { jobId } = parsed.data;
      const job = await filesService.getJob(jobId);

      const response = ApiResponse.success(job)
      return res.status(response.statusCode).json(response.data);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
