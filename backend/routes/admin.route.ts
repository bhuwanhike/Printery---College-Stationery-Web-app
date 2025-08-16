import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/isAdmin";
import {
  orderPracticalFilesController,
  changeFileStatus,
} from "../controller/orderPracticalFiles.controller";
import { getAllOrderedFilesController } from "../controller/admin.controller";
const Router = express.Router();

Router.route("/")
  .post(authMiddleware, adminMiddleware, orderPracticalFilesController)
  .get(authMiddleware, adminMiddleware, getAllOrderedFilesController)
  .put(authMiddleware, adminMiddleware, changeFileStatus);

export default Router;
