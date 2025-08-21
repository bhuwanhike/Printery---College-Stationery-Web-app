import express from "express";
import {
  fetchUserInfo,
  deleteAccount,
  updateUserInfo,
  updateUserPassword,
} from "../controller/settings.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:userID", authMiddleware, fetchUserInfo);
router
  .delete("/:userID", authMiddleware, deleteAccount)
  .put("/:userID", authMiddleware, updateUserInfo);
router.put("/change-password/:userID", authMiddleware, updateUserPassword);
export default router;
