"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const isAdmin_1 = __importDefault(require("../middleware/isAdmin"));
const orderPracticalFiles_controller_1 = require("../controller/orderPracticalFiles.controller");
const admin_controller_1 = require("../controller/admin.controller");
const Router = express_1.default.Router();
Router.route("/")
    .post(authMiddleware_1.authMiddleware, isAdmin_1.default, orderPracticalFiles_controller_1.orderPracticalFilesController)
    .get(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.getAllOrderedFilesController)
    .put(authMiddleware_1.authMiddleware, isAdmin_1.default, orderPracticalFiles_controller_1.changeFileStatus);
exports.default = Router;
