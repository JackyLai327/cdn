import { BadRequestError } from "../lib/errors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import type { FilesService } from "../services/filesService.js";
import { initiateUploadSchema } from "./schemas/files.schema.js";
import { type Request, type Response, type NextFunction } from "express";

export const initiateUpload = (filesService: FilesService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = initiateUploadSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new BadRequestError("Invalid input: " + JSON.stringify(parsed.error.format()));
      }

      const result = await filesService.initiateUpload(parsed.data);

      const response = ApiResponse.success({
        fileId: result.fileId,
        uploadURL: result.uploadURL,
        storageKey: result.storageKey,
      }, "File is ready to be uploaded")

      return res.status(response.statusCode).json(response.data);
    } catch (error) {
      next(error);
    }
  }
