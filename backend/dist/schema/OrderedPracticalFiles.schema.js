"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderedPracticalFilesSchema = new mongoose_1.default.Schema({
    ref_FileId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "PracticalFiles",
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "SignUp",
        required: true,
    },
    qty: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
    },
    deletedByUser: {
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true });
const OrderedPracticalFiles = mongoose_1.default.model("OrderedPracticalFile", orderedPracticalFilesSchema);
exports.default = OrderedPracticalFiles;
