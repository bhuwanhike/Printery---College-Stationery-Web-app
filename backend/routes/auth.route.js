"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const isAdmin_1 = __importDefault(require("../middleware/isAdmin"));
const Router = express_1.default.Router();
Router.route("/sign-up")
    .post(authMiddleware_1.authMiddleware, auth_controller_1.SignUpController)
    .get(authMiddleware_1.authMiddleware, isAdmin_1.default, auth_controller_1.fetchUsers);
Router.route("/login").post(auth_controller_1.LoginController);
Router.route("/me").get(auth_controller_1.getJWTdecode);
exports.default = Router;
