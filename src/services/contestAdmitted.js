import Contestparticipant from "../models/contestParticipant";

const updateAdmitted=async (contest_Id) =>{
    try{
        const Participants=await Contestparticipant.find({
            contest_id:contest_Id
        });

        Participants.sort((a,b)=>{
            if(b.score!==a.score)return b.score-a.score;
            const timeA = a.finishedAt - a.startedAt;
            const timeB = b.finishedAt - b.startedAt;
            return timeA - timeB;
        });

        let operations=[];
        let n=Math.min(80,Participants.length);
        for(let i=0;i<n;i++){
            Participants[i].admittedFromContest=contest_Id;
            operations.push({
                updateOne:{
                    filter:{_id: Participants[i]._id },
                    update:{$set:{admittedFromContest:contest_Id}}
                }
            })
        }
        if(Participants.length>0)await Contestparticipant.bulkWrite(operations);
    }
    catch(error){
        console.log(`Error: ${error.message}`);
    }
};

export default updateAdmitted;