import Contestparticipant from "../models/contestParticipant.js";

const calculateRank=async (contest_id)=>{
    try{
      const Participants = await Contestparticipant.find({
      contest_id: contest_id,
    });
    Participants.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const timeA = a.finishedAt - a.startedAt;
      const timeB = b.finishedAt - b.startedAt;
      return timeA - timeB;
    });

    let operations=[];
    for (let i = 0; i < Participants.length; i++) {
      Participants[i].rank = i + 1;

      operations.push({
        updateOne: {
          filter: { _id: Participants[i]._id },
          update: {
            $set: { rank: i + 1 , resultsCalculated:true},
          },
        },
      });
    }

    if(Participants.length>0)await Contestparticipant.bulkWrite(operations);
    return Participants;
    }
    catch(error){
        console.log(`Error: ${error.message}`);
    }
};

export default calculateRank;