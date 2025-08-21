import express from "express";
import multer from "multer";
import {
  uploadFilesToCloudinary,
  deleteSelectedFile,
  clearAllFiles,
} from "../controller/cloudinary.controller";
import { authMiddleware } from "../middleware/authMiddleware";
const Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

Router.route("/")
  .post(authMiddleware, upload.array("files"), uploadFilesToCloudinary)
  .put(authMiddleware, deleteSelectedFile);

Router.route("/delete-all-files").put(authMiddleware, clearAllFiles);

export default Router;
