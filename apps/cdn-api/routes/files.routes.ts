import express from "express";
import { initiateFiles } from "../controllers/files.controller.js";

const router = express.Router();

router.post("/initiate", initiateFiles);

export default router;
