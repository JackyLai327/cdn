import { BadRequestError } from "../lib/errors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import type { FilesService } from "../services/filesService.js";
import { type Request, type Response, type NextFunction } from "express";
import { completeUploadSchema, fileIdParamsSchema, initiateUploadSchema } from "./schemas/files.schema.js";

export const initiateUpload = (filesService: FilesService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = initiateUploadSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new BadRequestError("Invalid input: " + JSON.stringify(parsed.error.format()));
      }

      const result = await filesService.initiateUpload(parsed.data);
      const response = ApiResponse.success(result, "File is ready to be uploaded")

      return res.status(response.statusCode).json(response.data);
    } catch (error) {
      next(error);
    }
  }

export const completeUpload = (filesService: FilesService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = completeUploadSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new BadRequestError("Invalid input: " + JSON.stringify(parsed.error.format()));
      }

      const result = await filesService.completeUpload(parsed.data);
      const response = ApiResponse.success(result, "File uploaded successfully")

      return res.status(response.statusCode).json(response.data);
    } catch (error) {
      next(error);
    }
  };

export const getFileById = (filesService: FilesService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = fileIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new BadRequestError("Invalid file ID");
      }

      const result = filesService.getFile(parsed.data.id);
      const response = ApiResponse.success(result, "File retrieved successfully");

      return res.status(response.statusCode).json(response.data);
    } catch (error) {
      next(error);
    }
  }
