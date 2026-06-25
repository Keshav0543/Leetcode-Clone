import express from "express";
import userMiddleware from "../middlewares/usermiddleware.js";
import SubmitController from "../controllers/userSubmission.js";
const SubmitRouter=express.Router();


SubmitRouter.post("/submit/:id", userMiddleware, SubmitController.SubmitCode);


export default SubmitRouter;