"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logoutController = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict", // or "lax" depending on your setup
        secure: process.env.NODE_ENV === "production", // only in https
    });
    res.status(200).json({ message: "Logged out successfully" });
};
exports.default = logoutController;
