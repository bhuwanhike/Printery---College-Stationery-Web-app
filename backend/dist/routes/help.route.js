"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const help_controller_1 = require("../controller/help.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Router = express_1.default.Router();
Router.route("/")
    .post(authMiddleware_1.authMiddleware, help_controller_1.helpController)
    .get(authMiddleware_1.authMiddleware, help_controller_1.fetchHelpController)
    .put(authMiddleware_1.authMiddleware, help_controller_1.markDeleteTrue);
Router.route("/deleteAllQueries").put(authMiddleware_1.authMiddleware, help_controller_1.deleteAllQueries);
exports.default = Router;
