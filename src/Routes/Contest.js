import express from "express";
import adminMiddleware from "../middlewares/Adminmiddleware.js";
import userMiddleware from "../middlewares/usermiddleware.js";
import contestController from "../controllers/userContest.js";
import SubmitController from "../controllers/userSubmission.js";
const ContestRouter=express.Router();

ContestRouter.post("/contest/create", adminMiddleware, contestController.createContest);
ContestRouter.get("/contest", userMiddleware, contestController.getContest);
ContestRouter.get("/contest/:id", userMiddleware, contestController.getSpecific);
ContestRouter.post("/contest/register",userMiddleware,contestController.contestRegister);
ContestRouter.get("/contest/:id/arena",userMiddleware,contestController.startContest);
console.log("routes ke aandar")
ContestRouter.get("/contest/:contest_id/leaderboard",userMiddleware,SubmitController.getcontestSubmissionDetail);

export default ContestRouter;