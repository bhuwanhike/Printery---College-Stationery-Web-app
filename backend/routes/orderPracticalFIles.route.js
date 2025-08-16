"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderPracticalFiles_controller_1 = require("../controller/orderPracticalFiles.controller");
const orderPracticalFiles_controller_2 = require("../controller/orderPracticalFiles.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const isAdmin_1 = __importDefault(require("../middleware/isAdmin"));
const router = (0, express_1.Router)();
router
    .route("/")
    .post(authMiddleware_1.authMiddleware, orderPracticalFiles_controller_1.orderPracticalFilesController)
    .get(authMiddleware_1.authMiddleware, orderPracticalFiles_controller_1.getOrderedPracticalFilesController)
    .put(authMiddleware_1.authMiddleware, isAdmin_1.default, orderPracticalFiles_controller_2.changeFileStatus);
exports.default = router;
