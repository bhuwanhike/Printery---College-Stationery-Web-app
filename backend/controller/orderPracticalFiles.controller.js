"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllOrderedFilesController = exports.deleteSelectedOrderController = exports.getOrderedPracticalFilesController = exports.orderPracticalFilesController = void 0;
const OrderedPracticalFiles_schema_1 = __importDefault(require("../schema/OrderedPracticalFiles.schema"));
const practicalfiles_schema_1 = __importDefault(require("../schema/practicalfiles.schema"));
const orderPracticalFilesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const placeOrderFiles = req.body;
        if (!Array.isArray(placeOrderFiles)) {
            return res.status(400).json({ error: "Expected an array of orders" });
        }
        const savedOrders = yield OrderedPracticalFiles_schema_1.default.insertMany(placeOrderFiles);
        res.status(201).json({
            success: true,
            message: "Orders placed successfully",
            savedOrders,
        });
    }
    catch (error) {
        console.error("Error ordering practical files:", error);
        res.status(500).json({ error: "Failed to order practical files" });
    }
});
exports.orderPracticalFilesController = orderPracticalFilesController;
const getOrderedPracticalFilesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const orders = yield OrderedPracticalFiles_schema_1.default.find({ userId });
        const finalOrders = [];
        for (const file of orders) {
            const practicalFile = yield practicalfiles_schema_1.default.findById({
                _id: file.ref_FileId,
            });
            finalOrders.push({
                _id: file._id.toString(),
                ref_FileId: file.ref_FileId.toString(),
                name: practicalFile.name,
                department: practicalFile.department,
                year: practicalFile.year,
                subject_code: practicalFile.subject_code,
                qty: file.qty,
                status: file.status,
                deletedByUser: file.deletedByUser,
                createdAt: file.createdAt.toISOString(),
                updatedAt: file.updatedAt.toISOString(),
            });
        }
        res.status(200).json({ finalOrders });
    }
    catch (error) {
        console.error("Error fetching ordered practical files:", error);
        res.status(500).json({ error: "Failed to fetch ordered practical files" });
    }
});
exports.getOrderedPracticalFilesController = getOrderedPracticalFilesController;
const deleteSelectedOrderController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedOrder = yield OrderedPracticalFiles_schema_1.default.findByIdAndUpdate({ _id: id }, {
            deletedByUser: true,
        });
        res.status(200).json({ deletedOrder });
    }
    catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ error: "Failed to delete order" });
    }
});
exports.deleteSelectedOrderController = deleteSelectedOrderController;
const clearAllOrderedFilesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        yield OrderedPracticalFiles_schema_1.default.updateMany({ _id: { $in: ids } }, { $set: { deletedByUser: true } });
        res
            .status(200)
            .json({ success: true, message: "Orders cleared successfully" });
    }
    catch (error) {
        console.error("Error clearing orders:", error);
        res.status(500).json({ error: "Failed to clear orders" });
    }
});
exports.clearAllOrderedFilesController = clearAllOrderedFilesController;
