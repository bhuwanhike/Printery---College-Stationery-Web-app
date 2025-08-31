import express from "express";
import {
  SignUpController,
  LoginController,
  getJWTdecode,
  fetchUsers,
} from "../controller/auth.controller";
import { adminSettingsController } from "../controller/admin.controller";

const Router = express.Router();

Router.route("/sign-up").post(SignUpController).get(fetchUsers);
Router.route("/login").post(LoginController);
Router.route("/me").get(getJWTdecode);

export default Router;
