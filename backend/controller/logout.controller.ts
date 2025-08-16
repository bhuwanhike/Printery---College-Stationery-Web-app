import { Request, Response } from "express";

const logoutController = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict", // or "lax" depending on your setup
    secure: process.env.NODE_ENV === "production", // only in https
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export default logoutController;
