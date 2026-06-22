import express from "express";
import authController from "../controllers/userAuthent.js"
import userMiddleware from "../middlewares/usermiddleware.js";
import adminMiddleware from "../middlewares/Adminmiddleware.js";
//User Register

export default express.Router()
.post('/register',authController.register)
.post('/login',authController.login)
.post('/logout',userMiddleware,authController.logout)
.get('/getProfile',userMiddleware,authController.getProfile)
.post("/admin/register",adminMiddleware,authController.admin);

