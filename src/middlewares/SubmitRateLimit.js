import client from "../config/redis.js"



const Totalttl=60;
const Max_request=2;

const SubmitLimiter=async (req,res,next) =>{
    try{
        const key=`userId:${req.result._id}`;
        //Find CurrenTime and convert into seconds
        const currentTime=Date.now()/1000;
        const window_time=currentTime-Totalttl;

        //Now remove unwanted windows from redis
        await client.zRemRangeByScore(key,0,window_time);
        //Count the current ReqPool Size
        const NumberOfreq=await client.zCard(key);

        if(NumberOfreq>=Max_request)throw new Error("Cool Down My Friend, Try after someTime...");
        //Now aagar req fresh ha toh store karo uuse redis me
        await client.zAdd(key,[{score:currentTime,value:`${currentTime}:${Math.random()}`}]);

        //Now delete the Key in redis after TotalTTl reached
        await client.expire(key,Totalttl);

        next();
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
}

export default SubmitLimiter;