"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderPracticalFiles_controller_1 = require("../controller/orderPracticalFiles.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router
    .route("/")
    .post(authMiddleware_1.authMiddleware, orderPracticalFiles_controller_1.orderPracticalFilesController)
    .get(authMiddleware_1.authMiddleware, orderPracticalFiles_controller_1.getOrderedPracticalFilesController);
router.route("/deleteAll").put(authMiddleware_1.authMiddleware, orderPracticalFiles_controller_1.clearAllOrderedFilesController);
router.route("/:id").put(authMiddleware_1.authMiddleware, orderPracticalFiles_controller_1.deleteSelectedOrderController);
exports.default = router;
