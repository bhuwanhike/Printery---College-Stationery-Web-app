"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_controller_1 = require("../controller/cloudinary.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
Router.route("/")
    .post(authMiddleware_1.authMiddleware, upload.array("files"), cloudinary_controller_1.uploadFilesToCloudinary)
    .delete(cloudinary_controller_1.deleteCompletedFile);
Router.route("/delete-all-files").delete(cloudinary_controller_1.deleteAllFiles);
exports.default = Router;
