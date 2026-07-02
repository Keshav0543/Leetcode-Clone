import client from "../config/redis.js";

const max_Request=20; 
const TTL=60;
const RunrateLimit= async (req,res,next) =>{
    try{
        const key=`UserId:${req.result._id}`;
        const current_time=Date.now()/1000;
        const window_time=current_time-TTL;

        await client.zRemRangeByScore(key,0,window_time);
        const currReqPool=await client.zCard(key);

        if(currReqPool>=max_Request)throw new Error("Cool Down Bro, Try again Later...");

        // add the key in redis pool if not available
        await client.zAdd(key,[{score:current_time, value:`${current_time}:${Math.random()}`}]);

        // Delete the key if it unused
        await client.expire(key,TTL);

        next();
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
}

export default RunrateLimit;