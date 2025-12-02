import express from "express";
import { DBService } from "../services/dbService.js";
import { QueueService } from "../services/queueService.js";
import { FilesService } from "../services/filesService.js";
import { StorageService } from "../services/storageService.js";
import { initiateUpload } from "../controllers/files.controller.js";

const router = express.Router();

const filesService = new FilesService(new DBService(), new QueueService(), new StorageService());

// POST /api/files/initiate
router.post("/initiate", initiateUpload(filesService));

export default router;
