import { Router } from "express";
import {
  orderPracticalFilesController,
  getOrderedPracticalFilesController,
} from "../controller/orderPracticalFiles.controller";
import { changeFileStatus } from "../controller/orderPracticalFiles.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/isAdmin";
const router = Router();

router
  .route("/")
  .post(authMiddleware, orderPracticalFilesController)
  .get(authMiddleware, getOrderedPracticalFilesController)
  .put(authMiddleware, adminMiddleware, changeFileStatus);

export default router;
