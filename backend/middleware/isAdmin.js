"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adminMiddleware = (req, res, next) => {
    try {
        if (req.isAdmin) {
            next();
        }
        else {
            return res
                .status(403)
                .json({ message: "Access denied! User is not an admin" });
        }
    }
    catch (error) {
        console.error("Error in admin middleware:", error);
        return res.status(500).json({ message: "Failed to verify admin status" });
    }
};
exports.default = adminMiddleware;
