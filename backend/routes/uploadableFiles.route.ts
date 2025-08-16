import express from "express";
import {
  uploadFilesToDB,
  getFilesFromDB,
  changeStatus,
} from "../controller/uploadableFiles.controller";
import { authMiddleware } from "../middleware/authMiddleware";
const Router = express.Router();

Router.route("/")
  .post(authMiddleware, uploadFilesToDB)
  .get(authMiddleware, getFilesFromDB);
Router.route("/:id").put(authMiddleware, changeStatus);

export default Router;
