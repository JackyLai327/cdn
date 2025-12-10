import express from "express";
import { devAuthLoginController } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/dev/login", devAuthLoginController);

export default router;