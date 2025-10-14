import { Router } from "express";
import * as questionController from "../controllers/questionController";

const router = Router();

// GET /api/questions?level=1
router.get("/", questionController.getLevelQuestions);
// optional pretty route /api/questions/level/1
router.get("/level/:level", questionController.getLevelQuestions);

export default router;
