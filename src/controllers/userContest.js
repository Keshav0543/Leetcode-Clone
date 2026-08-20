import Contest from "../models/contest.js";
import User from "../models/user.js";
import Contestparticipant from "../models/contestParticipant.js";
import SubmissionS from "../models/Submission.js";
import getWeekendRange from "../utils/Rangefind.js";

const createContest = async (req, res) => {
  try {
    const { qualifier, type } = req.body;

    if (type === "sunday") {
      if (!qualifier) {
        throw new Error("Saturday qualifier contest is required...");
      }

      const saturdayContest = await Contest.findById(qualifier);

      if (!saturdayContest) {
        throw new Error("Reference Saturday contest does not exist...");
      }

      if (saturdayContest.type !== "saturday") {
        throw new Error("Reference Saturday ID is not valid...");
      }
    }

    const result = await Contest.create({
      ...req.body,
    });

    res.status(201).json({
      contest_id: result._id,
      message: `${result.type} Created Successfully...`,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getContest = async (req, res) => {
  try {
    const { startOfSaturday, startOfMonday } = getWeekendRange();

    const currTime = new Date();

    const result = await Contest.find({
      startTime: {
        $gte: startOfSaturday,
        $lt: startOfMonday,
      },
      endTime: {
        $gt: currTime,
      },
    });

    const saturdayContest = result.find(
      (contest) => contest.type === "saturday",
    );

    const sundayContest = result.find((contest) => contest.type === "sunday");

    const getStatus = (contest) => {
      if (!contest) {
        return "Expired";
      }

      if (currTime < contest.startTime) {
        return "Upcoming";
      }

      if (currTime >= contest.startTime && currTime < contest.endTime) {
        return "Running";
      }

      return "Expired";
    };

    res.status(200).json({
      saturdayContest: {
        contest: saturdayContest || null,
        status: getStatus(saturdayContest),
      },

      sundayContest: {
        contest: sundayContest || null,
        status: getStatus(sundayContest),
      },
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const getSpecific = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) throw new Error("ID is not present...");
    const info = await Contest.findById(id);
    if (!info) throw new Error("Select Valid Contest...");

    function getStatus(){
      if(info.status==="Upcoming")return "Upcoming";
      else if(info.status==="Live")return "Live";
      else return "Ended";
    }

    res.status(200).json({
      contest:info,
      status:getStatus()
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const contestRegister = async (req, res) => {
  try {
    const { contest_id } = req.body;
    const user_id = req.result._id;

    if (!contest_id) throw new Error("Select Contest Before begin...");

    if (!user_id) throw new Error("Logged in first to continue....");

    const iscontestvalid = await Contest.findById(contest_id);

    if (!iscontestvalid) throw new Error("Selected Contest is not present...");

    const currentTime = new Date();

    if (currentTime < iscontestvalid.startTime)
      throw new Error("Contest Registration Not Started yet...");

    const isavailable = await Contestparticipant.exists({
      contest_id,
      user_id,
    });

    if (isavailable) throw new Error("Already registered for this contest...");

    // Saturday Contest
    if (iscontestvalid.type === "saturday") {
      const result = await Contestparticipant.create({
        contest_id,
        user_id,
      });

      return res.status(201).json({
        message: "Successfully registered for Saturday contest...",
        participant: result,
      });
    }

    // Sunday Contest
    else if (iscontestvalid.type === "sunday") {
      // Sunday must have a qualifier contest
      if (!iscontestvalid.qualifier)
        throw new Error(
          "You are not eligible for this contest, try to join Saturday contest first...",
        );

      // Find user's participation in the qualifying Saturday contest
      const saturdayParticipant = await Contestparticipant.findOne({
        contest_id: iscontestvalid.qualifier,
        user_id,
      });

      // User didn't participate in the qualifying Saturday
      if (!saturdayParticipant)
        throw new Error(
          "You did not participate in the qualifying Saturday contest...",
        );

      // User participated but was not admitted
      if (!saturdayParticipant.admittedFromContest)
        throw new Error("You are not eligible for Sunday Contest...");

      // Make sure admission came from THIS qualifier contest
      if (
        saturdayParticipant.admittedFromContest.toString() !==
        iscontestvalid.qualifier.toString()
      ) {
        throw new Error("You are not eligible for this Sunday Contest...");
      }

      // Register user for Sunday
      const participant = await Contestparticipant.create({
        contest_id,
        user_id,
      });

      return res.status(201).json({
        message: "Successfully registered for Sunday contest...",
        participant,
      });
    }

    throw new Error("Invalid contest type...");
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const startContest = async (req, res) => {
  try {
    const { contest_id } = req.body;
    if (!contest_id) throw new Error("Contest Id is not available...");
    const user_id = req.result._id;
    const isregister = await Contestparticipant.findOne({
      contest_id,
      user_id,
    });
    if (!isregister)
      throw new Error("You Are Not Register For This contest...");
    const contestInfo =
      await Contest.findById(contest_id).populate("problem.problemId");
    if (!contestInfo)
      throw new Error("contestId is wrong try again with ActualId...");
    const currTime = new Date();
    if (currTime < contestInfo.startTime)
      throw new Error("Contest has not started yet...");
    if (currTime > contestInfo.endTime)
      throw new Error("This Contest is Not available...");
    if (isregister.startedAt) throw new Error("Contest is started allready");
    isregister.startedAt = currTime;
    isregister.status = "started";
    const problemInfo = contestInfo.problem;
    await isregister.save();
    res.status(200).json({
      ProblemInfo: problemInfo,
      startTimer: isregister.startedAt,
      FinishcontestTime: contestInfo.endTime,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const finishContest = async (req, res) => {
  try {
    const { contest_id } = req.body;

    if (!contest_id) throw new Error("Contest is not present...");

    const user_id = req.result._id;

    if (!user_id)
      throw new Error("You don't have permission to access this...");

    const resultdoc = await Contestparticipant.findOne({
      contest_id,
      user_id,
    });

    if (!resultdoc)
      throw new Error("User is not registered for this contest...");

    if (resultdoc.status === "finished")
      throw new Error("Already submitted your contest...");

    if (resultdoc.status !== "started")
      throw new Error("User hasn't started the contest...");

    const contestInfo = await Contest.findById(contest_id);

    if (!contestInfo) throw new Error("Contest not found...");

    const currentTime = new Date();

    // User's 90-minute deadline
    const userDeadline = new Date(
      resultdoc.startedAt.getTime() + 90 * 60 * 1000,
    );

    // Actual deadline is whichever comes first:
    // user's 90-minute deadline OR global contest end time
    const finalDeadline =
      userDeadline < contestInfo.endTime ? userDeadline : contestInfo.endTime;

    // Allow a small grace period for network/request delay
    const gracePeriod = 5 * 1000; // 5 seconds

    const allowedUntil = new Date(finalDeadline.getTime() + gracePeriod);

    if (currentTime > allowedUntil) {
      throw new Error("Contest finish time has expired...");
    }

    const SavedResult = await SubmissionS.find({
      userId: user_id,
      contestId: contest_id,
    });

    const AcceptedData = new Set();

    for (const obj of SavedResult) {
      if (obj.status === "Accepted") {
        AcceptedData.add(obj.problemId);
      }
    }

    let countScore = 0;

    for (const obj of contestInfo.problem) {
      if (AcceptedData.has(obj.problemId)) {
        countScore += obj.points;
      }
    }

    resultdoc.score = countScore;
    resultdoc.status = "finished";
    resultdoc.finishedAt = currentTime;

    await resultdoc.save();

    res.status(200).json({
      message: "Contest Successfully Closed...",
      score: countScore,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export default {
  createContest,
  getContest,
  getSpecific,
  contestRegister,
  contestRegister,
  finishContest,
};
