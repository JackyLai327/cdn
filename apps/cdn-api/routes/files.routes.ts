import express from "express";
import { dbService } from "../services/dbService.js";
import { queueService } from "../services/queueService.js";
import { FilesService } from "../services/filesService.js";
import { storageService } from "../services/storageService.js";
import { completeUpload, initiateUpload } from "../controllers/files.controller.js";

const router = express.Router();

const filesService = new FilesService(dbService, queueService, storageService);

// POST /api/files/initiate
router.post("/initiate", initiateUpload(filesService));

// POST /api/files/complete
router.post("/complete", completeUpload(filesService));

export default router;
