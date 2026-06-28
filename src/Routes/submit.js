import express from "express";
import userMiddleware from "../middlewares/usermiddleware.js";
import SubmitController from "../controllers/userSubmission.js";
import SubmitLimiter from "../middlewares/SubmitRateLimit.js";
const SubmitRouter=express.Router();

SubmitRouter.post("/submit/:id", userMiddleware, SubmitLimiter, SubmitController.SubmitCode);
SubmitRouter.post("/run/:id", userMiddleware,SubmitController.RunCode);

export default SubmitRouter;