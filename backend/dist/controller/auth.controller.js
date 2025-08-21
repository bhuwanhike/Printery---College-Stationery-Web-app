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
exports.fetchUsers = exports.getJWTdecode = exports.LoginController = exports.SignUpController = void 0;
const sign_up_schema_1 = __importDefault(require("../schema/sign-up.schema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SignUpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { admissionNo, department, year, password } = req.body;
        const existingUser = yield sign_up_schema_1.default.findOne({ admissionNo: admissionNo });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const user = yield sign_up_schema_1.default.create({
            admissionNo,
            department,
            year,
            password,
        });
        res.status(201).json({ message: "User registered successfully", user });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Failed to register user" });
    }
});
exports.SignUpController = SignUpController;
const LoginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { admissionNo, password, admin_username } = req.body;
        if (admin_username) {
            const existingAdmin = yield sign_up_schema_1.default.findOne({
                admissionNo: admin_username,
                isAdmin: true,
            });
            if (!existingAdmin) {
                return res.status(404).json({ message: "Admin not found" });
            }
            const isMatch = yield existingAdmin.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect password" });
            }
            const token = existingAdmin.generateToken(); // no await if you make it sync
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            return res
                .status(200)
                .json({ message: "Login successful", isAdmin: true });
        }
        else {
            const existingUser = yield sign_up_schema_1.default.findOne({ admissionNo: admissionNo });
            if (!existingUser) {
                return res.status(404).json({ message: "User not found" });
            }
            const isMatch = yield existingUser.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect password" });
            }
            const token = existingUser.generateToken(); // no await if you make it sync
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            return res
                .status(200)
                .json({ message: "Login successful", isAdmin: false });
        }
    }
    catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Failed to log in" });
    }
});
exports.LoginController = LoginController;
const getJWTdecode = (req, res) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ error: "Unauthorized from getJWTdecode" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        res.json({
            admissionNo: decoded.admissionNo,
            userId: decoded.userId,
            isAdmin: decoded.isAdmin,
        });
    }
    catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};
exports.getJWTdecode = getJWTdecode;
const fetchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield sign_up_schema_1.default.find()
            .select("-password")
            .where({ isAdmin: false });
        res.status(200).json({ message: "Users fetched successfully", users });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});
exports.fetchUsers = fetchUsers;
