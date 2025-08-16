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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signUpSchema = new mongoose_1.default.Schema({
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
    department: {
        type: String,
        required: true,
        enum: ["CSE", "ECE", "ME", "CE", "EE"],
        message: "Department must be one of CSE, ECE, ME, CE, or EE",
        trim: true,
    },
    year: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4],
        message: "Year must be between 1 and 4",
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must be at least 8 characters long"],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
signUpSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            next();
        }
        try {
            const hashPassword = yield bcrypt_1.default.hash(this.password, 10);
            this.password = hashPassword;
        }
        catch (error) {
            next(error);
        }
    });
});
signUpSchema.index({ admissionNo: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
signUpSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        const isMatch = yield bcrypt_1.default.compare(password, this.password);
        return isMatch;
    });
};
signUpSchema.methods.generateToken = function () {
    try {
        const token = jsonwebtoken_1.default.sign({
            userId: this._id.toString(),
            admissionNo: this.admissionNo,
            isAdmin: this.isAdmin,
        }, process.env.JWT_SECRET, { expiresIn: "30d" });
        return token;
    }
    catch (error) {
        console.log("Error generating token", error);
        throw new Error("Token generation failed");
    }
};
const SignUp = mongoose_1.default.model("SignUp", signUpSchema);
exports.default = SignUp;
