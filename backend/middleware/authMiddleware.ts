import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface MyJwtPayload {
  userId: string;
  admissionNo: string;
  isAdmin: boolean;
}
export interface AuthRequest extends Request {
  userId?: string;
  admissionNo?: string;
  isAdmin?: boolean;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token; // Cookie name from your login route

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided. Unauthorized." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as MyJwtPayload;
    req.userId = decoded.userId;
    req.admissionNo = decoded.admissionNo;
    req.isAdmin = decoded.isAdmin;

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
