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
  deleteFileParamsSchema,
  deleteFilesForUserParamsSchema,
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

      return res
        .status(response.statusCode)
        .json({ data: response.data, message: response.message });
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

      return res
        .status(response.statusCode)
        .json({ data: response.data, message: response.message });
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
        throw new NotFoundError("File not found");
      }

      const status = result.status;
      const bustCache = status === "deleted";

      const variants = (result.variants || []).map((v) => {
        return {
          width: v.width,
          height: v.height,
          bytes: v.bytes,
          url: v.url,
          cdnUrl: `${config.CDN_BASE_URL}/${config.S3_BUCKET_PROCESSED}/${
            v.key
          }${bustCache ? `?bust=${Date.now()}` : ""}`,
        };
      });

      const response = ApiResponse.success(
        {
          ...result,
          variants,
        },
        "File retrieved successfully"
      );

      return res
        .status(response.statusCode)
        .json({ data: response.data, message: response.message });
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

      const { userId, page, pageSize, sortBy, sortOrder } = parsed.data;

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

      return res
        .status(response.statusCode)
        .json({ data: response.data, message: response.message });
    } catch (error) {
      next(error);
    }
  };

export const deleteFileHandler =
  (filesService: FilesService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = deleteFileParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new BadRequestError("Invalid file ID");
      }

      const { id } = parsed.data;
      const file = await filesService.getFile(id);
      if (!file) {
        throw new NotFoundError("File not found");
      }

      if (file.status === "deleted") {
        const response = ApiResponse.success("File is already deleted.");
        return res
          .status(response.statusCode)
          .json({ data: response.data, message: response.message });
      }

      if (file.status === "pending_delete") {
        const response = ApiResponse.success("File delete is already pending.");
        return res
          .status(response.statusCode)
          .json({ data: response.data, message: response.message });
      }

      await filesService.requestDelete(id);

      const response = ApiResponse.success("File delete requested.");

      return res
        .status(response.statusCode)
        .json({ data: response.data, message: response.message });
    } catch (error) {
      next(error);
    }
  };

export const deleteFilesForUserHandler =
  (filesService: FilesService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = deleteFilesForUserParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new BadRequestError("Invalid user ID");
      }

      const { userId } = parsed.data;
      const result = await filesService.requestDeleteForUser(userId);

      const response = ApiResponse.success(result, "Files delete requested.");

      return res
        .status(response.statusCode)
        .json({ data: response.data, message: response.message });
    } catch (error) {
      next(error);
    }
  };
