import express from "express";
import adminMiddleware from "../middlewares/Adminmiddleware.js";
import userMiddleware from "../middlewares/usermiddleware.js";
import contestController from "../controllers/userContest.js";
const ContestRouter=express.Router();

ContestRouter.post("/contest/create", adminMiddleware, contestController.createContest);
ContestRouter.get("/contest", userMiddleware, contestController.getContest);
ContestRouter.get("/contest/:id", userMiddleware, contestController.getSpecific);
ContestRouter.post("/contest/register",userMiddleware, contestController.contestRegister);
ContestRouter.post("/contest/finish",userMiddleware, contestController.finishContest);


export default ContestRouter;