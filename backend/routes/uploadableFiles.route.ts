import express from "express";
import {
  uploadFilesToDB,
  getFilesFromDB,
} from "../controller/uploadableFiles.controller";
import { authMiddleware } from "../middleware/authMiddleware";
const Router = express.Router();

Router.route("/")
  .post(authMiddleware, uploadFilesToDB)
  .get(authMiddleware, getFilesFromDB);

export default Router;
