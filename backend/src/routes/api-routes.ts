import { Router } from "express";
import { importCSV, healthCheck } from "../controllers/import-controller.js";

const router = Router();

// POST /api/import - Import and process CSV
router.post("/import", importCSV);

// GET /api/health - Health check
router.get("/health", healthCheck);

export default router;
