import express from "express";
import {
  SignUpController,
  LoginController,
  getJWTdecode,
  fetchUsers,
} from "../controller/auth.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/isAdmin";
const Router = express.Router();

Router.route("/sign-up")
  .post(authMiddleware, SignUpController)
  .get(authMiddleware, adminMiddleware, fetchUsers);
Router.route("/login").post(LoginController);
Router.route("/me").get(getJWTdecode);

export default Router;
