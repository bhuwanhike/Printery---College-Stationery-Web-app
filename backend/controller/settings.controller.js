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
exports.updateUserPassword = exports.updateUserInfo = exports.deleteAccount = exports.fetchUserInfo = void 0;
const help_schema_1 = __importDefault(require("../schema/help.schema"));
const OrderedPracticalFiles_schema_1 = __importDefault(require("../schema/OrderedPracticalFiles.schema"));
const sign_up_schema_1 = __importDefault(require("../schema/sign-up.schema"));
const uploadableFiles_schema_1 = __importDefault(require("../schema/uploadableFiles.schema"));
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
cloudinary_1.default.v2.config({
    secure: true,
});
const fetchUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const user = yield sign_up_schema_1.default.findOne({ _id: userID });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User found", user });
    }
    catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({ message: "Failed to fetch user info" });
    }
});
exports.fetchUserInfo = fetchUserInfo;
const updateUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const user = yield sign_up_schema_1.default.findOne({ _id: userID });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.admissionNo = req.body.admissionNo;
        user.department = req.body.department;
        user.year = req.body.year;
        yield user.save();
        res.status(200).json({ message: "User updated successfully", user });
    }
    catch (error) {
        console.error("Error updating user info:", error);
        res.status(500).json({ message: "Failed to update user info" });
    }
});
exports.updateUserInfo = updateUserInfo;
const updateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const { newPassword, currentPassword } = req.body;
        const user = yield sign_up_schema_1.default.findOne({ _id: userID });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // 2. Check old password
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        // 3. Set new password (hashing happens in pre("save"))
        user.password = newPassword;
        yield user.save();
        res.status(200).json({ message: "User updated successfully", user });
    }
    catch (error) {
        console.error("Error updating user info:", error);
        res.status(500).json({ message: "Failed to update user info" });
    }
});
exports.updateUserPassword = updateUserPassword;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const folderName = yield sign_up_schema_1.default.findOne({ _id: userID });
        if (!folderName) {
            return res.status(404).json({ message: "User not found" });
        }
        const prefix = folderName.admissionNo;
        for (const type of ["image", "video", "raw"]) {
            yield cloudinary_1.default.v2.api.delete_resources_by_prefix(prefix, {
                resource_type: type,
                invalidate: true,
            });
        }
        yield sign_up_schema_1.default.findOneAndDelete({ _id: userID });
        yield help_schema_1.default.deleteMany({ ref_userId: userID });
        const orderedPracticalFiles = yield OrderedPracticalFiles_schema_1.default.deleteMany({
            userId: userID,
        });
        const uploadFiles = yield uploadableFiles_schema_1.default.deleteMany({ userId: userID });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
});
exports.deleteAccount = deleteAccount;
