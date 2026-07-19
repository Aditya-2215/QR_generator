import { Router } from "express";
import { QRController } from "../controllers/qrController";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/generate", optionalAuthMiddleware, QRController.generate);
router.get("/", authMiddleware, QRController.getQRs);
router.get("/:id", optionalAuthMiddleware, QRController.getQRById);
router.put("/:id", authMiddleware, QRController.updateQR);
router.delete("/:id", authMiddleware, QRController.deleteQR);
router.patch("/:id/favorite", authMiddleware, QRController.toggleFavorite);
router.patch("/:id/download", QRController.recordDownload);

export default router;
