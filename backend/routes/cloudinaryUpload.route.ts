import express from "express";
import multer from "multer";
import {
  uploadFilesToCloudinary,
  deleteCompletedFile,
  deleteAllFiles,
} from "../controller/cloudinary.controller";
import { authMiddleware } from "../middleware/authMiddleware";
const Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

Router.route("/")
  .post(authMiddleware, upload.array("files"), uploadFilesToCloudinary)
  .delete(deleteCompletedFile);

Router.route("/delete-all-files").delete(deleteAllFiles);

export default Router;
