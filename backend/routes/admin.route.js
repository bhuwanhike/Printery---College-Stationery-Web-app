"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const isAdmin_1 = __importDefault(require("../middleware/isAdmin"));
const admin_controller_1 = require("../controller/admin.controller");
const Router = express_1.default.Router();
Router.route("/")
    .post(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.orderPracticalFilesController)
    .get(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.getAllOrderedFilesController)
    .delete(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.deleteSelectedFile);
Router.route("/changeFileStatus").put(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.changeFileStatus);
Router.route("/printouts").delete(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.clearAllPrintouts);
Router.route("/orderedFiles/delete-selected").delete(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.deleteSelectedOrderedFile);
Router.route("/orderedFiles/delete-all").delete(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.clearAllOrderedFiles);
Router.route("/tickets")
    .get(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.getTickets)
    .put(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.changeTicketStatus)
    .delete(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.clearAllTickets);
Router.route("/changePrintoutStatus/:id").put(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.changePrintoutStatus);
Router.route("/tickets/:_id").delete(authMiddleware_1.authMiddleware, isAdmin_1.default, admin_controller_1.deleteTicket);
exports.default = Router;
