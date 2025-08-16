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
exports.getAllOrderedFilesController = void 0;
const OrderedPracticalFiles_schema_1 = __importDefault(require("../schema/OrderedPracticalFiles.schema"));
const practicalfiles_schema_1 = __importDefault(require("../schema/practicalfiles.schema"));
const getAllOrderedFilesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield OrderedPracticalFiles_schema_1.default.find();
        const finalOrders = [];
        for (const file of files) {
            const practicalFile = yield practicalfiles_schema_1.default.findById({
                _id: file.ref_FileId,
            });
            finalOrders.push({
                _id: file._id.toString(),
                userId: file.userId.toString(),
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
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});
exports.getAllOrderedFilesController = getAllOrderedFilesController;
