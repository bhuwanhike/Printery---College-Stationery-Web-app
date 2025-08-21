"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadableFiles_controller_1 = require("../controller/uploadableFiles.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Router = express_1.default.Router();
Router.route("/")
    .post(authMiddleware_1.authMiddleware, uploadableFiles_controller_1.uploadFilesToDB)
    .get(authMiddleware_1.authMiddleware, uploadableFiles_controller_1.getFilesFromDB);
exports.default = Router;
