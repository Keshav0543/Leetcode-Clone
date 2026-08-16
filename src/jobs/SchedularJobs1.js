import cron from 'node-cron';
import Contest from '../models/contest.js';
import contestRank from "../services/contestRank.js";

cron.schedule('0 0 * * 6', async ()=>{
    await contestRank();
})