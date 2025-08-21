"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settings_controller_1 = require("../controller/settings.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/:userID", authMiddleware_1.authMiddleware, settings_controller_1.fetchUserInfo);
router
    .delete("/:userID", authMiddleware_1.authMiddleware, settings_controller_1.deleteAccount)
    .put("/:userID", authMiddleware_1.authMiddleware, settings_controller_1.updateUserInfo);
router.put("/change-password/:userID", authMiddleware_1.authMiddleware, settings_controller_1.updateUserPassword);
exports.default = router;
