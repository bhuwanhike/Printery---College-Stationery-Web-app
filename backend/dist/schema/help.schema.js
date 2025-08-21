"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const helpSchema = new mongoose_1.default.Schema({
    ref_userId: {
        type: String,
        required: true,
    },
    admissionNo: {
        type: String,
        required: true,
        match: [
            /^[A-Za-z0-9]+$/i,
            "Admission number must contain only letters and numbers",
        ],
        minlength: [13, "Admission No. must be 13 characters long"],
        maxlength: [13, "Admission No. must be 13 characters long"],
        trim: true,
    },
    email: {
        type: String,
        required: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid email address",
        ],
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
    },
    deletedByUser: {
        type: Boolean,
        default: false,
        required: true,
    },
}, { timestamps: true });
const Help = mongoose_1.default.model("Help", helpSchema);
exports.default = Help;
