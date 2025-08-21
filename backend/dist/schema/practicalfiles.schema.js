"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const practicalFilesSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        enum: {
            values: [1, 2, 3, 4],
            message: "Year must be between 1 and 4",
        },
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    subject_code: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const PracticalFiles = mongoose_1.default.model("Practicalfile", practicalFilesSchema);
exports.default = PracticalFiles;
