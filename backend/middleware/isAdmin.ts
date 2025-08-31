import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.isAdmin) {
      next();
    } else {
      console.log("Access denied! User is not an admin");
      return res
        .status(403)
        .json({ message: "Access denied! User is not an admin" });
    }
  } catch (error) {
    console.error("Error in admin middleware:", error);
    return res.status(500).json({ message: "Failed to verify admin status" });
  }
};
export default adminMiddleware;
