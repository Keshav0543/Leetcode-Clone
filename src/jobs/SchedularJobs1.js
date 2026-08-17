import cron from 'node-cron';
import Contest from '../models/contest.js';
import contestRank from "../services/contestRank.js";
import updateAdmitted from '../services/contestAdmitted.js';

const getContestid = async () => {
    try {
        const result = await Contest.findOne({
            type: "saturday",
            endTime: { $lt: new Date() },
            qualificationProcessed:false
        });
        return result;
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
};

cron.schedule('0 0 * * 6', async ()=>{
    const result=await getContestid();
    await updateAdmitted(result._id);
    result.qualificationProcessed=true;
    await result.save();
},{timezone:"Asia/Kolkata"});