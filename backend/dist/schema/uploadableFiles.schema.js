"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uploadFilesSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "SignUp",
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    isColored: {
        type: Boolean,
        required: true,
    },
    amount: {
        type: Number,
        default: 3,
    },
    qty: {
        type: Number,
        required: true,
    },
    hash: { type: String, required: true },
    deletedByUser: {
        type: Boolean,
        required: true,
        default: false,
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
    },
    publicId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
delete mongoose_1.default.models.UploadFiles;
const UploadFiles = mongoose_1.default.model("UploadFiles", uploadFilesSchema);
exports.default = UploadFiles;
