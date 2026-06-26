import dotenv from "dotenv";
dotenv.config();
import express from "express";
import main from "./config/db.js";
import cookieparser from "cookie-parser";
import authRouter from "./Routes/userauthen.js";
import client from "./config/redis.js";
import problemRouter from "./Routes/problemCreator.js";
import SubmitRouter from "./Routes/submit.js";

const app=express();


//Middlewares
app.use(express.json());
app.use(cookieparser());
app.use("/user",authRouter);
app.use("/user",problemRouter);
app.use("/user",SubmitRouter);


const InitializeConnection=async ()=>{
    try{

        await Promise.all([main(),client.connect()]);
        console.log("Database connected...");
        app.listen(process.env.PORT, () => {
        console.log(
            `Server listening On portNo: ${process.env.PORT}`
        );
    });

    }
    catch(err){
        console.log("Error: "+err.message);
    }
}
InitializeConnection();  