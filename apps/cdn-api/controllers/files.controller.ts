import { config } from "../config/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import type { FilesService } from "../services/filesService.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";
import { type Request, type Response, type NextFunction } from "express";
import {
  fileIdParamsSchema,
  completeUploadSchema,
  initiateUploadSchema,
  listFilesQuerySchema,
} from "./schemas/files.schema.js";

export const initiateUpload =
  (filesService: FilesService) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = initiateUploadSchema.safeParse(req.body || {});
        if (!parsed.success) {
          throw new BadRequestError(
            "Invalid input: " + JSON.stringify(parsed.error.format())
          );
        }

        const result = await filesService.initiateUpload(parsed.data);
        const response = ApiResponse.success(
          result,
          "File is ready to be uploaded"
        );

        return res.status(response.statusCode).json(response.data);
      } catch (error) {
        next(error);
      }
    };

export const completeUpload =
  (filesService: FilesService) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = completeUploadSchema.safeParse(req.body || {});
        if (!parsed.success) {
          throw new BadRequestError(
            "Invalid input: " + JSON.stringify(parsed.error.format())
          );
        }

        const result = await filesService.completeUpload(parsed.data);
        const response = ApiResponse.success(
          result,
          "File uploaded successfully"
        );

        return res.status(response.statusCode).json(response.data);
      } catch (error) {
        next(error);
      }
    };

export const getFileById =
  (filesService: FilesService) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = fileIdParamsSchema.safeParse(req.params);
        if (!parsed.success) {
          throw new BadRequestError("Invalid file ID");
        }

        const result = await filesService.getFile(parsed.data.id);
        if (!result) {
          const response = ApiResponse.error("File not found", 404);
          return res.status(response.statusCode).json(response.data);
        }

        const variants = (result.variants || []).map((v) => {
          return {
            width: v.width,
            height: v.height,
            bytes: v.bytes,
            url: v.url,
            cdnUrl: `${config.CDN_BASE_URL}/${config.S3_BUCKET_PROCESSED}/${v.key}`,
          };
        });

        const response = ApiResponse.success(
          {
            ...result,
            variants,
          },
          "File retrieved successfully"
        );

        return res.status(response.statusCode).json(response.data);
      } catch (error) {
        next(error);
      }
    };

export const listFilesHandler =
  (filesService: FilesService) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = listFilesQuerySchema.safeParse(req.query);
        if (!parsed.success) {
          throw new BadRequestError(
            "Invalid query parameters: " + JSON.stringify(parsed.error.format())
          );
        }

        const {
          userId,
          page,
          pageSize,
          sortBy,
          sortOrder
        } = parsed.data;

        const result = await filesService.listFiles({
          userId,
          page,
          pageSize,
          sortBy,
          sortOrder,
        });

        const response = ApiResponse.success(
          result,
          "Files retrieved successfully"
        );

        return res.status(response.statusCode).json(response.data);
      } catch (error) {
        next(error);
      }
    };
