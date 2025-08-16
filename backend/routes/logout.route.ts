import { Router } from "express";
import logoutController from "../controller/logout.controller";
const router = Router();

router.route("/").post(logoutController);

export default router;
