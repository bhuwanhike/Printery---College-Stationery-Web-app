import express from "express";
import {
  helpController,
  fetchHelpController,
  markDeleteTrue,
  deleteAllQueries,
} from "../controller/help.controller";
import { authMiddleware } from "../middleware/authMiddleware";
const Router = express.Router();

Router.route("/")
  .post(authMiddleware, helpController)
  .get(authMiddleware, fetchHelpController)
  .put(authMiddleware, markDeleteTrue);

Router.route("/deleteAllQueries").put(authMiddleware, deleteAllQueries);

export default Router;
