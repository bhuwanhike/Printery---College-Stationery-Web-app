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
exports.changeFileStatus = exports.getOrderedPracticalFilesController = exports.orderPracticalFilesController = void 0;
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
                ref_FileId: file.ref_FileId.toString(),
                name: practicalFile.name,
                branch: practicalFile.branch,
                year: practicalFile.year,
                subject_code: practicalFile.subject_code,
                qty: file.qty,
                status: file.status,
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
const changeFileStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { ref_FileId } = req.body;
        const updatedOrder = yield OrderedPracticalFiles_schema_1.default.findOneAndUpdate({ ref_FileId: ref_FileId, userId }, { status: "completed" }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ updatedOrder });
    }
    catch (error) {
        console.error("Error changing file status:", error);
        res.status(500).json({ error: "Failed to change file status" });
    }
});
exports.changeFileStatus = changeFileStatus;
