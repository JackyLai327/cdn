import express from "express";
import { dbService } from "../services/dbService.js";
import { queueService } from "../services/queueService.js";
import { FilesService } from "../services/filesService.js";
import { storageService } from "../services/storageService.js";
import { completeUpload, deleteFileHandler, deleteFilesForUserHandler, getFileById, initiateUpload, listFilesHandler } from "../controllers/files.controller.js";

const router = express.Router();

const filesService = new FilesService(dbService, queueService, storageService);

// POST /api/files/initiate
router.post("/initiate", initiateUpload(filesService));

// POST /api/files/complete
router.post("/complete", completeUpload(filesService));

// GET /api/files/:id
router.get("/:id", getFileById(filesService));

// GET /api/files
router.get("/", listFilesHandler(filesService));

// DELETE /api/files/:id
router.delete("/:id", deleteFileHandler(filesService));

// DELETE /api/files/user/:userId
router.delete("/user/:userId", deleteFilesForUserHandler(filesService));

export default router;
