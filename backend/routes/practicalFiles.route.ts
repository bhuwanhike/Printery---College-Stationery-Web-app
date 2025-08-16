import express from "express";
import getPracticalFiles from "../controller/practicalFiles.controller";

const Router = express.Router();

Router.route("/").get(getPracticalFiles);

export default Router;
